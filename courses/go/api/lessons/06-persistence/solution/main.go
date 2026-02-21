package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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
	tasks    []Task
	nextID   int = 1
	mu       sync.Mutex
	dataFile string = "tasks.json"
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

type Middleware func(http.Handler) http.Handler

func chain(handler http.Handler, middlewares ...Middleware) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}

func requestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := requestCounter.Add(1)
		w.Header().Set("X-Request-ID", fmt.Sprintf("%d", id))
		next.ServeHTTP(w, r)
	})
}

func saveTasks() error {
	mu.Lock()
	data, err := json.MarshalIndent(tasks, "", "  ")
	mu.Unlock()
	if err != nil {
		return err
	}
	return os.WriteFile(dataFile, data, 0644)
}

func loadTasks() error {
	data, err := os.ReadFile(dataFile)
	if err != nil {
		if os.IsNotExist(err) {
			tasks = []Task{}
			return nil
		}
		return err
	}

	mu.Lock()
	defer mu.Unlock()

	if err := json.Unmarshal(data, &tasks); err != nil {
		return err
	}

	// Set nextID to max ID + 1
	for _, task := range tasks {
		if task.ID >= nextID {
			nextID = task.ID + 1
		}
	}

	return nil
}

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

func newHandler() http.Handler {
	return chain(newMux(), requestIDMiddleware, loggingMiddleware)
}

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

	saveTasks()

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
			go saveTasks()
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
			go saveTasks()
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	writeError(w, http.StatusNotFound, "task not found")
}

func main() {
	if err := loadTasks(); err != nil {
		log.Fatalf("Failed to load tasks: %v", err)
	}
	log.Printf("Loaded %d tasks from %s", len(tasks), dataFile)

	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", newHandler())
}
