package main

import (
	"net/http"
)

func newServer(courses []*Course) http.Handler {
	mux := http.NewServeMux()

	// Build course index
	courseIndex := make(map[string]*Course)
	for _, c := range courses {
		courseIndex[c.ID] = c
	}

	// REST endpoints
	mux.HandleFunc("GET /api/courses", handleListCourses(courses))
	mux.HandleFunc("GET /api/courses/{id}", handleGetCourse(courseIndex))
	mux.HandleFunc("GET /api/courses/{id}/lessons/{slug}", handleGetLesson(courseIndex))

	// WebSocket endpoints
	mux.HandleFunc("/api/run", handleRun(courseIndex))
	mux.HandleFunc("/api/terminal", handleTerminal(courseIndex))

	return corsMiddleware(mux)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
