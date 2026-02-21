package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func resetState() {
	mu.Lock()
	tasks = []Task{}
	nextID = 1
	mu.Unlock()
	requestCounter.Store(0)
}

func TestRequestIDMiddleware(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newHandler())
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/health")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	reqID := resp.Header.Get("X-Request-ID")
	if reqID == "" {
		t.Error("Expected X-Request-ID header to be set")
	}
	if reqID != "1" {
		t.Errorf("Expected X-Request-ID to be %q, got %q", "1", reqID)
	}

	// Second request should have incremented ID
	resp2, err := http.Get(srv.URL + "/health")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp2.Body.Close()

	reqID2 := resp2.Header.Get("X-Request-ID")
	if reqID2 != "2" {
		t.Errorf("Expected X-Request-ID to be %q, got %q", "2", reqID2)
	}
}

func TestLoggingMiddleware(t *testing.T) {
	resetState()
	// Just verify the middleware doesn't break anything
	srv := httptest.NewServer(newHandler())
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/health")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func TestMiddlewareChain(t *testing.T) {
	resetState()
	srv := httptest.NewServer(newHandler())
	defer srv.Close()

	// Verify that both middlewares work together
	resp, err := http.Get(srv.URL + "/health")
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Should have request ID (from requestIDMiddleware)
	if resp.Header.Get("X-Request-ID") == "" {
		t.Error("Expected X-Request-ID header from middleware chain")
	}

	// Should still return correct response (handler works through chain)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 through middleware chain, got %d", resp.StatusCode)
	}

	ct := resp.Header.Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("Expected Content-Type application/json, got %q", ct)
	}
}
