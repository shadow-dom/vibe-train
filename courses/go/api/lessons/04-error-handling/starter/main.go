package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type Task struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// TODO: Define an ErrorResponse struct with a single field:
//   Error string `json:"error"`

// TODO: Define a validStatuses map that contains the allowed status values:
//   "todo", "in_progress", "done"

var (
	tasks  []Task
	nextID int = 1
	mu     sync.Mutex
)

// TODO: Implement writeJSON(w http.ResponseWriter, status int, v interface{})
// This helper should:
//   1. Set Content-Type to "application/json"
//   2. Write the status code
//   3. Encode v as JSON

// TODO: Implement writeError(w http.ResponseWriter, status int, message string)
// This helper should call writeJSON with an ErrorResponse{Error: message}

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

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func handleCreateTask(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title string `json:"title"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: Add validation — if input.Title is empty, return a 400 error
	// using writeError(w, http.StatusBadRequest, "title is required")

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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

func handleListTasks(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	result := tasks
	if result == nil {
		result = []Task{}
	}
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleGetTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	for _, task := range tasks {
		if task.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(task)
			return
		}
	}

	http.Error(w, "task not found", http.StatusNotFound)
}

func handleUpdateTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var input struct {
		Title  *string `json:"title"`
		Status *string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// TODO: Add validation:
	// - If input.Title is non-nil but empty, return 400 with "title cannot be empty"
	// - If input.Status is non-nil but not in validStatuses, return 400 with
	//   "invalid status: must be one of todo, in_progress, done"

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
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(tasks[i])
			return
		}
	}

	http.Error(w, "task not found", http.StatusNotFound)
}

func handleDeleteTask(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
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

	http.Error(w, "task not found", http.StatusNotFound)
}

func main() {
	tasks = []Task{}
	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", newMux())
}
