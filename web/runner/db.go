package main

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

type Store struct {
	db *sql.DB
}

type User struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	CreatedAt string `json:"created_at"`
}

type Completion struct {
	ID             int    `json:"id"`
	UserID         string `json:"user_id"`
	CourseID       string `json:"course_id"`
	LessonSlug     string `json:"lesson_slug"`
	Points         int    `json:"points"`
	ViewedSolution bool   `json:"viewed_solution"`
	CompletedAt    string `json:"completed_at"`
}

type LeaderboardEntry struct {
	UserID         string `json:"user_id"`
	Username       string `json:"username"`
	TotalPoints    int    `json:"total_points"`
	CompletedCount int    `json:"completed_count"`
}

type CourseProgress struct {
	Completed int `json:"completed"`
	Total     int `json:"total"`
}

func OpenStore(path string) (*Store, error) {
	db, err := sql.Open("sqlite", path+"?_pragma=journal_mode(wal)&_pragma=busy_timeout(5000)")
	if err != nil {
		return nil, fmt.Errorf("opening database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("pinging database: %w", err)
	}

	s := &Store{db: db}
	if err := s.migrate(); err != nil {
		return nil, fmt.Errorf("running migrations: %w", err)
	}

	return s, nil
}

func (s *Store) migrate() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT NOT NULL UNIQUE,
			created_at TEXT NOT NULL DEFAULT (datetime('now'))
		);
		CREATE TABLE IF NOT EXISTS completions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id TEXT NOT NULL REFERENCES users(id),
			course_id TEXT NOT NULL,
			lesson_slug TEXT NOT NULL,
			points INTEGER NOT NULL,
			viewed_solution INTEGER NOT NULL DEFAULT 0,
			completed_at TEXT NOT NULL DEFAULT (datetime('now')),
			UNIQUE(user_id, course_id, lesson_slug)
		);
	`)
	return err
}

func (s *Store) CreateUser(username string) (*User, error) {
	id := uuid.New().String()
	now := time.Now().UTC().Format("2006-01-02 15:04:05")

	_, err := s.db.Exec(
		"INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)",
		id, username, now,
	)
	if err != nil {
		return nil, err
	}

	return &User{ID: id, Username: username, CreatedAt: now}, nil
}

func (s *Store) GetUser(id string) (*User, error) {
	var u User
	err := s.db.QueryRow(
		"SELECT id, username, created_at FROM users WHERE id = ?", id,
	).Scan(&u.ID, &u.Username, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (s *Store) GetUserTotalPoints(userID string) (int, error) {
	var total int
	err := s.db.QueryRow(
		"SELECT COALESCE(SUM(points), 0) FROM completions WHERE user_id = ?", userID,
	).Scan(&total)
	return total, err
}

func (s *Store) RecordCompletion(userID, courseID, lessonSlug string, points int, viewedSolution bool) error {
	viewed := 0
	if viewedSolution {
		viewed = 1
	}
	_, err := s.db.Exec(`
		INSERT INTO completions (user_id, course_id, lesson_slug, points, viewed_solution)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(user_id, course_id, lesson_slug) DO NOTHING
	`, userID, courseID, lessonSlug, points, viewed)
	return err
}

func (s *Store) RecordCourseBonus(userID, courseID string, bonusPoints int) error {
	_, err := s.db.Exec(`
		INSERT INTO completions (user_id, course_id, lesson_slug, points, viewed_solution)
		VALUES (?, ?, '__course_bonus__', ?, 0)
		ON CONFLICT(user_id, course_id, lesson_slug) DO NOTHING
	`, userID, courseID, bonusPoints)
	return err
}

func (s *Store) GetUserCompletions(userID string) ([]Completion, error) {
	rows, err := s.db.Query(`
		SELECT id, user_id, course_id, lesson_slug, points, viewed_solution, completed_at
		FROM completions
		WHERE user_id = ? AND lesson_slug != '__course_bonus__'
		ORDER BY completed_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var completions []Completion
	for rows.Next() {
		var c Completion
		var viewed int
		if err := rows.Scan(&c.ID, &c.UserID, &c.CourseID, &c.LessonSlug, &c.Points, &viewed, &c.CompletedAt); err != nil {
			return nil, err
		}
		c.ViewedSolution = viewed != 0
		completions = append(completions, c)
	}
	return completions, rows.Err()
}

func (s *Store) GetCourseCompletions(userID, courseID string) ([]Completion, error) {
	rows, err := s.db.Query(`
		SELECT id, user_id, course_id, lesson_slug, points, viewed_solution, completed_at
		FROM completions
		WHERE user_id = ? AND course_id = ? AND lesson_slug != '__course_bonus__'
		ORDER BY completed_at ASC
	`, userID, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var completions []Completion
	for rows.Next() {
		var c Completion
		var viewed int
		if err := rows.Scan(&c.ID, &c.UserID, &c.CourseID, &c.LessonSlug, &c.Points, &viewed, &c.CompletedAt); err != nil {
			return nil, err
		}
		c.ViewedSolution = viewed != 0
		completions = append(completions, c)
	}
	return completions, rows.Err()
}

func (s *Store) GetLeaderboard(limit int) ([]LeaderboardEntry, error) {
	rows, err := s.db.Query(`
		SELECT u.id, u.username, COALESCE(SUM(c.points), 0) AS total_points,
			COUNT(CASE WHEN c.lesson_slug != '__course_bonus__' THEN 1 END) AS completed_count
		FROM users u
		LEFT JOIN completions c ON u.id = c.user_id
		GROUP BY u.id
		HAVING total_points > 0
		ORDER BY total_points DESC
		LIMIT ?
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []LeaderboardEntry
	for rows.Next() {
		var e LeaderboardEntry
		if err := rows.Scan(&e.UserID, &e.Username, &e.TotalPoints, &e.CompletedCount); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

func (s *Store) GetCompletedLessonsMap(userID, courseID string) (map[string]bool, error) {
	rows, err := s.db.Query(`
		SELECT lesson_slug FROM completions
		WHERE user_id = ? AND course_id = ? AND lesson_slug != '__course_bonus__'
	`, userID, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	m := make(map[string]bool)
	for rows.Next() {
		var slug string
		if err := rows.Scan(&slug); err != nil {
			return nil, err
		}
		m[slug] = true
	}
	return m, rows.Err()
}

func (s *Store) GetCompletedLessonCounts(userID string) (map[string]int, error) {
	rows, err := s.db.Query(`
		SELECT course_id, COUNT(*) FROM completions
		WHERE user_id = ? AND lesson_slug != '__course_bonus__'
		GROUP BY course_id
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	m := make(map[string]int)
	for rows.Next() {
		var courseID string
		var count int
		if err := rows.Scan(&courseID, &count); err != nil {
			return nil, err
		}
		m[courseID] = count
	}
	return m, rows.Err()
}

func (s *Store) HasCourseBonus(userID, courseID string) (bool, error) {
	var count int
	err := s.db.QueryRow(`
		SELECT COUNT(*) FROM completions
		WHERE user_id = ? AND course_id = ? AND lesson_slug = '__course_bonus__'
	`, userID, courseID).Scan(&count)
	return count > 0, err
}
