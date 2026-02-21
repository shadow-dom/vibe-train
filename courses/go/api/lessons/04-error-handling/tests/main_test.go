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

func TestCreateTaskValidation(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	t.Run("empty title returns 400", func(t *testing.T) {
		body := `{"title":""}`
		resp, err := http.Post(srv.URL+"/tasks", "application/json", strings.NewReader(body))
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", resp.StatusCode)
		}

		var errResp ErrorResponse
		json.NewDecoder(resp.Body).Decode(&errResp)
		if errResp.Error != "title is required" {
			t.Errorf("Expected error %q, got %q", "title is required", errResp.Error)
		}
	})

	t.Run("missing title returns 400", func(t *testing.T) {
		body := `{}`
		resp, err := http.Post(srv.URL+"/tasks", "application/json", strings.NewReader(body))
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", resp.StatusCode)
		}
	})
}

func TestUpdateTaskValidation(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	// Create a task first
	http.Post(srv.URL+"/tasks", "application/json", strings.NewReader(`{"title":"Test"}`))

	t.Run("invalid status returns 400", func(t *testing.T) {
		body := `{"status":"invalid"}`
		req, _ := http.NewRequest("PUT", srv.URL+"/tasks/1", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", resp.StatusCode)
		}

		var errResp ErrorResponse
		json.NewDecoder(resp.Body).Decode(&errResp)
		if errResp.Error == "" {
			t.Error("Expected error message in response")
		}
	})

	t.Run("empty title returns 400", func(t *testing.T) {
		body := `{"title":""}`
		req, _ := http.NewRequest("PUT", srv.URL+"/tasks/1", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatalf("Failed to make request: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", resp.StatusCode)
		}
	})

	t.Run("valid status accepted", func(t *testing.T) {
		for _, status := range []string{"todo", "in_progress", "done"} {
			body := `{"status":"` + status + `"}`
			req, _ := http.NewRequest("PUT", srv.URL+"/tasks/1", strings.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				t.Fatalf("Failed to make request: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Errorf("Expected status 200 for status %q, got %d", status, resp.StatusCode)
			}
		}
	})
}

func TestErrorResponseFormat(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newMux())
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/tasks/999")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	ct := resp.Header.Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Expected Content-Type application/json, got %q", ct)
	}

	var errResp ErrorResponse
	if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
		t.Fatalf("Failed to decode error response as JSON: %v", err)
	}

	if errResp.Error == "" {
		t.Error("Expected non-empty error message")
	}
}
