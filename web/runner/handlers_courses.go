package main

import (
	"encoding/json"
	"net/http"
)

type CourseListItem struct {
	ID             string   `json:"id"`
	Title          string   `json:"title"`
	Description    string   `json:"description"`
	Language       string   `json:"language"`
	Difficulty     string   `json:"difficulty"`
	EstimatedHours int      `json:"estimated_hours"`
	Tags           []string `json:"tags"`
	LessonCount    int      `json:"lesson_count"`
}

func handleListCourses(courses []*Course) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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
		}
		writeJSON(w, http.StatusOK, items)
	}
}

func handleGetCourse(index map[string]*Course) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		course, ok := index[id]
		if !ok {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "course not found"})
			return
		}
		writeJSON(w, http.StatusOK, course)
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
