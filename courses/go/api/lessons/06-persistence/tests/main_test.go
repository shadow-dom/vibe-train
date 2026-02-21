package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

func resetState() {
	mu.Lock()
	tasks = []Task{}
	nextID = 1
	mu.Unlock()
	requestCounter.Store(0)
	os.Remove(dataFile)
}

func TestSaveAndLoadTasks(t *testing.T) {
	resetState()

	// Add some tasks
	mu.Lock()
	tasks = []Task{
		{ID: 1, Title: "Task 1", Status: "todo", CreatedAt: time.Now()},
		{ID: 2, Title: "Task 2", Status: "done", CreatedAt: time.Now()},
	}
	nextID = 3
	mu.Unlock()

	// Save
	if err := saveTasks(); err != nil {
		t.Fatalf("Failed to save tasks: %v", err)
	}

	// Verify file exists
	if _, err := os.Stat(dataFile); os.IsNotExist(err) {
		t.Fatal("Expected data file to be created")
	}

	// Reset and load
	mu.Lock()
	tasks = []Task{}
	nextID = 1
	mu.Unlock()

	if err := loadTasks(); err != nil {
		t.Fatalf("Failed to load tasks: %v", err)
	}

	mu.Lock()
	defer mu.Unlock()

	if len(tasks) != 2 {
		t.Errorf("Expected 2 tasks after load, got %d", len(tasks))
	}

	if nextID != 3 {
		t.Errorf("Expected nextID to be 3 after load, got %d", nextID)
	}
}

func TestLoadTasksFileNotExist(t *testing.T) {
	resetState()

	if err := loadTasks(); err != nil {
		t.Fatalf("loadTasks should not error on missing file: %v", err)
	}

	mu.Lock()
	defer mu.Unlock()

	if len(tasks) != 0 {
		t.Errorf("Expected 0 tasks when file doesn't exist, got %d", len(tasks))
	}
}

func TestPersistenceAfterCreate(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newHandler())
	defer srv.Close()

	// Create a task via API
	body := `{"title":"Persistent task"}`
	resp, err := http.Post(srv.URL+"/tasks", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	resp.Body.Close()

	// Wait a moment for async save
	time.Sleep(100 * time.Millisecond)

	// Verify file was created
	data, err := os.ReadFile(dataFile)
	if err != nil {
		t.Fatalf("Expected data file to exist after create: %v", err)
	}

	var saved []Task
	if err := json.Unmarshal(data, &saved); err != nil {
		t.Fatalf("Failed to parse saved data: %v", err)
	}

	if len(saved) != 1 {
		t.Errorf("Expected 1 saved task, got %d", len(saved))
	}

	if saved[0].Title != "Persistent task" {
		t.Errorf("Expected title %q, got %q", "Persistent task", saved[0].Title)
	}
}
