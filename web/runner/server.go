package main

import (
	"net/http"
)

func newServer(courses []*Course, store *Store) http.Handler {
	mux := http.NewServeMux()

	// Build course index
	courseIndex := make(map[string]*Course)
	for _, c := range courses {
		courseIndex[c.ID] = c
	}

	// REST endpoints
	mux.HandleFunc("GET /api/courses", handleListCourses(courses, store))
	mux.HandleFunc("GET /api/courses/{id}", handleGetCourse(courseIndex, store))
	mux.HandleFunc("GET /api/courses/{id}/lessons/{slug}", handleGetLesson(courseIndex))

	// Auth endpoints
	mux.HandleFunc("POST /api/users", handleCreateUser(store))
	mux.HandleFunc("GET /api/users/me", handleGetMe(store))
	mux.HandleFunc("GET /api/users/me/progress", handleGetMyProgress(store))

	// Leaderboard
	mux.HandleFunc("GET /api/leaderboard", handleGetLeaderboard(store))

	// WebSocket endpoints
	mux.HandleFunc("/api/run", handleRun(courseIndex, store))
	mux.HandleFunc("/api/terminal", handleTerminal(courseIndex))

	return corsMiddleware(mux)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
