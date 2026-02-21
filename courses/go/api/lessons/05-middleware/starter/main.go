package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"sync/atomic"
	"time"
)

type Task struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var validStatuses = map[string]bool{
	"todo":        true,
	"in_progress": true,
	"done":        true,
}

var (
	tasks  []Task
	nextID int = 1
	mu     sync.Mutex
)

var requestCounter atomic.Int64

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, ErrorResponse{Error: message})
}

// TODO: Define a Middleware type: type Middleware func(http.Handler) http.Handler

// TODO: Implement chain(handler http.Handler, middlewares ...Middleware) http.Handler
// This function wraps a handler with multiple middlewares.
// Apply them in reverse order so the first middleware in the list runs first:
//
//   func chain(handler http.Handler, middlewares ...Middleware) http.Handler {
//       for i := len(middlewares) - 1; i >= 0; i-- {
//           handler = middlewares[i](handler)
//       }
//       return handler
//   }

// TODO: Implement loggingMiddleware(next http.Handler) http.Handler
// It should:
//   1. Record the start time
//   2. Call next.ServeHTTP(w, r)
//   3. Log the method, path, and duration using log.Printf

// TODO: Implement requestIDMiddleware(next http.Handler) http.Handler
// It should:
//   1. Increment requestCounter using requestCounter.Add(1)
//   2. Set the "X-Request-ID" header on the response
//   3. Call next.ServeHTTP(w, r)

func newMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("POST /tasks", handleCreateTask)
	mux.HandleFunc("GET /tasks", handleListTasks)
	mux.HandleFunc("GET /tasks/{id}", handleGetTask)
	mux.HandleFunc("PUT /tasks/{id}", handleUpdateTask)
	mux.HandleFunc("DELETE /tasks/{id}", handleDeleteTask)

	return mux
}

// TODO: Implement newHandler() http.Handler
// It should return: chain(newMux(), requestIDMiddleware, loggingMiddleware)

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func handleCreateTask(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title string `json:"title"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	if input.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}

	mu.Lock()
	task := Task{
		ID:        nextID,
		Title:     input.Title,
		Status:    "todo",
		CreatedAt: time.Now(),
	}
	nextID++
	tasks = append(tasks, task)
	mu.Unlock()

	writeJSON(w, http.StatusCreated, task)
}

func handleListTasks(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	result := tasks
	if result == nil {
		result = []Task{}
	}
	mu.Unlock()

	writeJSON(w, http.StatusOK, result)
}

func handleGetTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid task ID")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	for _, task := range tasks {
		if task.ID == id {
			writeJSON(w, http.StatusOK, task)
			return
		}
	}

	writeError(w, http.StatusNotFound, "task not found")
}

func handleUpdateTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid task ID")
		return
	}

	var input struct {
		Title  *string `json:"title"`
		Status *string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	if input.Title != nil && *input.Title == "" {
		writeError(w, http.StatusBadRequest, "title cannot be empty")
		return
	}

	if input.Status != nil && !validStatuses[*input.Status] {
		writeError(w, http.StatusBadRequest, "invalid status: must be one of todo, in_progress, done")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	for i, task := range tasks {
		if task.ID == id {
			if input.Title != nil {
				tasks[i].Title = *input.Title
			}
			if input.Status != nil {
				tasks[i].Status = *input.Status
			}
			writeJSON(w, http.StatusOK, tasks[i])
			return
		}
	}

	writeError(w, http.StatusNotFound, "task not found")
}

func handleDeleteTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid task ID")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	for i, task := range tasks {
		if task.ID == id {
			tasks = append(tasks[:i], tasks[i+1:]...)
			_ = task
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	writeError(w, http.StatusNotFound, "task not found")
}

// Keep imports used
var _ = log.Printf
var _ = fmt.Sprintf

func main() {
	tasks = []Task{}
	fmt.Println("Server starting on :8080")
	// TODO: Change this to use newHandler() instead of newMux()
	http.ListenAndServe(":8080", newMux())
}
