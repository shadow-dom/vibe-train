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

var (
	tasks  []Task
	nextID int = 1
	mu     sync.Mutex
)

func newMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("POST /tasks", handleCreateTask)
	mux.HandleFunc("GET /tasks", handleListTasks)

	// TODO: Register handlers for individual task operations:
	//   mux.HandleFunc("GET /tasks/{id}", handleGetTask)
	//   mux.HandleFunc("PUT /tasks/{id}", handleUpdateTask)
	//   mux.HandleFunc("DELETE /tasks/{id}", handleDeleteTask)

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
	// TODO: Implement get task by ID
	//
	// 1. Extract the "id" from the URL path: r.PathValue("id")
	// 2. Convert it to an int: strconv.Atoi(idStr)
	//    - If conversion fails, return http.StatusBadRequest
	// 3. Lock the mutex, search for the task in the tasks slice
	// 4. If found: set Content-Type and encode as JSON
	// 5. If not found: return http.StatusNotFound with "task not found"

	http.Error(w, "not implemented", http.StatusNotImplemented)
}

func handleUpdateTask(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement update task
	//
	// 1. Extract and parse the "id" from the URL path
	// 2. Decode the JSON body into a struct with optional fields:
	//      var input struct {
	//          Title  *string `json:"title"`
	//          Status *string `json:"status"`
	//      }
	// 3. Lock the mutex, find the task, update non-nil fields
	// 4. Return the updated task as JSON
	// 5. If not found: return http.StatusNotFound

	http.Error(w, "not implemented", http.StatusNotImplemented)
}

func handleDeleteTask(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement delete task
	//
	// 1. Extract and parse the "id" from the URL path
	// 2. Lock the mutex, find the task
	// 3. Remove it from the slice: tasks = append(tasks[:i], tasks[i+1:]...)
	// 4. Return http.StatusNoContent (204) with no body
	// 5. If not found: return http.StatusNotFound

	http.Error(w, "not implemented", http.StatusNotImplemented)
}

// Keep this variable referenced so the import doesn't error
var _ = strconv.Atoi

func main() {
	tasks = []Task{}
	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", newMux())
}
