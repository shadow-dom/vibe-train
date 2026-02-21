package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

// resetState clears all tasks and resets the ID counter.
// This is provided for you — use it at the start of each test.
func resetState() {
	mu.Lock()
	tasks = []Task{}
	nextID = 1
	mu.Unlock()
	requestCounter.Store(0)
	os.Remove(dataFile)
}

// makeRequest is a test helper that creates and executes an HTTP request.
// This is provided for you — use it to simplify your test code.
func makeRequest(t *testing.T, srv *httptest.Server, method, path, body string) *http.Response {
	t.Helper()
	var req *http.Request
	var err error
	if body != "" {
		req, err = http.NewRequest(method, srv.URL+path, strings.NewReader(body))
	} else {
		req, err = http.NewRequest(method, srv.URL+path, nil)
	}
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	return resp
}

// TODO: Implement TestCRUDOperations using table-driven tests.
//
// Table-driven tests use a slice of test cases and loop over them:
//
//   tests := []struct {
//       name       string
//       method     string
//       path       string
//       body       string
//       wantStatus int
//   }{
//       {name: "create task", method: "POST", path: "/tasks", body: `{"title":"Test"}`, wantStatus: 201},
//       {name: "list tasks", method: "GET", path: "/tasks", body: "", wantStatus: 200},
//       // ... add more cases
//   }
//
//   for _, tt := range tests {
//       t.Run(tt.name, func(t *testing.T) {
//           resp := makeRequest(t, srv, tt.method, tt.path, tt.body)
//           defer resp.Body.Close()
//           if resp.StatusCode != tt.wantStatus {
//               t.Errorf("%s: expected status %d, got %d", tt.name, tt.wantStatus, resp.StatusCode)
//           }
//       })
//   }
//
// Your test should cover:
//   1. POST /tasks — creates a task (201)
//   2. GET /tasks — lists tasks (200)
//   3. GET /tasks/1 — gets a specific task (200)
//   4. PUT /tasks/1 — updates a task (200)
//   5. DELETE /tasks/1 — deletes a task (204)
//   6. GET /tasks/1 — returns 404 after deletion

// TODO: Implement TestValidationErrors using table-driven tests.
//
// Your test should cover:
//   1. POST /tasks with empty title — returns 400
//   2. PUT /tasks/1 with invalid status — returns 400
//   3. GET /tasks/999 — returns 404
//
// Remember to create a task first (for the PUT test) before running validation tests.

func TestCRUDOperations(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newHandler())
	defer srv.Close()

	tests := []struct {
		name       string
		method     string
		path       string
		body       string
		wantStatus int
	}{
		{"create task", "POST", "/tasks", `{"title":"Test task"}`, http.StatusCreated},
		{"list tasks", "GET", "/tasks", "", http.StatusOK},
		{"get task", "GET", "/tasks/1", "", http.StatusOK},
		{"update task", "PUT", "/tasks/1", `{"status":"done"}`, http.StatusOK},
		{"delete task", "DELETE", "/tasks/1", "", http.StatusNoContent},
		{"get deleted task", "GET", "/tasks/1", "", http.StatusNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := makeRequest(t, srv, tt.method, tt.path, tt.body)
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("expected status %d, got %d", tt.wantStatus, resp.StatusCode)
			}
		})
	}
}

func TestValidationErrors(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newHandler())
	defer srv.Close()

	// Create a task for PUT tests
	makeRequest(t, srv, "POST", "/tasks", `{"title":"Test"}`)

	tests := []struct {
		name       string
		method     string
		path       string
		body       string
		wantStatus int
		wantError  string
	}{
		{"empty title", "POST", "/tasks", `{"title":""}`, http.StatusBadRequest, "title is required"},
		{"invalid status", "PUT", "/tasks/1", `{"status":"invalid"}`, http.StatusBadRequest, "invalid status"},
		{"not found", "GET", "/tasks/999", "", http.StatusNotFound, "task not found"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := makeRequest(t, srv, tt.method, tt.path, tt.body)
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("expected status %d, got %d", tt.wantStatus, resp.StatusCode)
			}

			if tt.wantError != "" {
				var errResp ErrorResponse
				json.NewDecoder(resp.Body).Decode(&errResp)
				if !strings.Contains(errResp.Error, tt.wantError) {
					t.Errorf("expected error containing %q, got %q", tt.wantError, errResp.Error)
				}
			}
		})
	}
}
