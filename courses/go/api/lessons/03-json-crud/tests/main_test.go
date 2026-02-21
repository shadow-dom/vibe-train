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

func createTask(t *testing.T, srv *httptest.Server, title string) Task {
	t.Helper()
	body := `{"title":"` + title + `"}`
	resp, err := http.Post(srv.URL+"/tasks", "application/json", strings.NewReader(body))
	if err != nil {
		t.Fatalf("Failed to create task: %v", err)
	}
	defer resp.Body.Close()
	var task Task
	json.NewDecoder(resp.Body).Decode(&task)
	return task
}

func TestGetTask(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	created := createTask(t, srv, "Test task")

	resp, err := http.Get(srv.URL + "/tasks/1")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	var task Task
	json.NewDecoder(resp.Body).Decode(&task)

	if task.ID != created.ID {
		t.Errorf("Expected ID %d, got %d", created.ID, task.ID)
	}
	if task.Title != "Test task" {
		t.Errorf("Expected title %q, got %q", "Test task", task.Title)
	}
}

func TestGetTaskNotFound(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/tasks/999")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", resp.StatusCode)
	}
}

func TestUpdateTask(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	createTask(t, srv, "Original title")

	body := `{"title":"Updated title","status":"done"}`
	req, _ := http.NewRequest("PUT", srv.URL+"/tasks/1", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	var task Task
	json.NewDecoder(resp.Body).Decode(&task)

	if task.Title != "Updated title" {
		t.Errorf("Expected title %q, got %q", "Updated title", task.Title)
	}
	if task.Status != "done" {
		t.Errorf("Expected status %q, got %q", "done", task.Status)
	}
}

func TestDeleteTask(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	createTask(t, srv, "Task to delete")

	req, _ := http.NewRequest("DELETE", srv.URL+"/tasks/1", nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("Expected status 204, got %d", resp.StatusCode)
	}

	// Verify task is gone
	resp2, _ := http.Get(srv.URL + "/tasks/1")
	defer resp2.Body.Close()

	if resp2.StatusCode != http.StatusNotFound {
		t.Errorf("Expected deleted task to return 404, got %d", resp2.StatusCode)
	}
}
