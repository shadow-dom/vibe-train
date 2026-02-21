package main

import (
	"encoding/json"
	"fmt"
	"net/http"
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

	// TODO: Register a handler for "POST /tasks" that calls handleCreateTask
	// TODO: Register a handler for "GET /tasks" that calls handleListTasks

	return mux
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func handleCreateTask(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement task creation
	//
	// 1. Decode the JSON request body into a struct with a Title field:
	//      var input struct { Title string `json:"title"` }
	//      json.NewDecoder(r.Body).Decode(&input)
	//
	// 2. Lock the mutex, create a Task with:
	//      - ID: nextID (then increment nextID)
	//      - Title: input.Title
	//      - Status: "todo"
	//      - CreatedAt: time.Now()
	//    Append it to the tasks slice, then unlock.
	//
	// 3. Set Content-Type to "application/json"
	// 4. Set status code to 201 (http.StatusCreated)
	// 5. Encode the task as JSON: json.NewEncoder(w).Encode(task)

	http.Error(w, "not implemented", http.StatusNotImplemented)
}

func handleListTasks(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement task listing
	//
	// 1. Lock the mutex, copy the tasks slice (use []Task{} if nil), then unlock.
	// 2. Set Content-Type to "application/json"
	// 3. Encode the tasks as JSON: json.NewEncoder(w).Encode(result)

	http.Error(w, "not implemented", http.StatusNotImplemented)
}

func main() {
	tasks = []Task{}
	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", newMux())
}
