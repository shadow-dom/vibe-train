package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func resetState() {
	mu.Lock()
	tasks = []Task{}
	nextID = 1
	mu.Unlock()
}

func TestCreateTask(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	body := `{"title":"Buy groceries"}`
	resp, err := http.Post(srv.URL+"/tasks", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", resp.StatusCode)
	}

	var task Task
	if err := json.NewDecoder(resp.Body).Decode(&task); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if task.ID != 1 {
		t.Errorf("Expected ID 1, got %d", task.ID)
	}
	if task.Title != "Buy groceries" {
		t.Errorf("Expected title %q, got %q", "Buy groceries", task.Title)
	}
	if task.Status != "todo" {
		t.Errorf("Expected status %q, got %q", "todo", task.Status)
	}
}

func TestListTasks(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	// List should return empty array initially
	resp, err := http.Get(srv.URL + "/tasks")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	var taskList []Task
	if err := json.NewDecoder(resp.Body).Decode(&taskList); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if len(taskList) != 0 {
		t.Errorf("Expected 0 tasks, got %d", len(taskList))
	}

	// Create a task, then list again
	body := `{"title":"Walk the dog"}`
	http.Post(srv.URL+"/tasks", "application/json", strings.NewReader(body))

	resp2, err := http.Get(srv.URL + "/tasks")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp2.Body.Close()

	var taskList2 []Task
	if err := json.NewDecoder(resp2.Body).Decode(&taskList2); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if len(taskList2) != 1 {
		t.Errorf("Expected 1 task, got %d", len(taskList2))
	}
}
