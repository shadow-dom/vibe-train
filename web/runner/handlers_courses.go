package main

import (
	"encoding/json"
	"net/http"
)

type CourseListItem struct {
	ID               string   `json:"id"`
	Title            string   `json:"title"`
	Description      string   `json:"description"`
	Language         string   `json:"language"`
	Difficulty       string   `json:"difficulty"`
	EstimatedHours   int      `json:"estimated_hours"`
	Tags             []string `json:"tags"`
	LessonCount      int      `json:"lesson_count"`
	CompletedLessons int      `json:"completed_lessons,omitempty"`
}

func handleListCourses(courses []*Course, store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var counts map[string]int
		if user, err := getUserFromCookie(r, store); err == nil {
			counts, _ = store.GetCompletedLessonCounts(user.ID)
		}

		items := make([]CourseListItem, len(courses))
		for i, c := range courses {
			items[i] = CourseListItem{
				ID:             c.ID,
				Title:          c.Title,
				Description:    c.Description,
				Language:       c.Language,
				Difficulty:     c.Difficulty,
				EstimatedHours: c.EstimatedHours,
				Tags:           c.Tags,
				LessonCount:    len(c.Lessons),
			}
			if counts != nil {
				items[i].CompletedLessons = counts[c.ID]
			}
		}
		writeJSON(w, http.StatusOK, items)
	}
}

type CourseDetail struct {
	*Course
	UserProgress map[string]bool `json:"user_progress,omitempty"`
}

func handleGetCourse(index map[string]*Course, store *Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		course, ok := index[id]
		if !ok {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "course not found"})
			return
		}

		detail := CourseDetail{Course: course}
		if user, err := getUserFromCookie(r, store); err == nil {
			detail.UserProgress, _ = store.GetCompletedLessonsMap(user.ID, id)
		}

		writeJSON(w, http.StatusOK, detail)
	}
}

func handleGetLesson(index map[string]*Course) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		slug := r.PathValue("slug")

		course, ok := index[id]
		if !ok {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "course not found"})
			return
		}

		detail, err := LoadLessonDetail(course, slug)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
			return
		}

		writeJSON(w, http.StatusOK, detail)
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
