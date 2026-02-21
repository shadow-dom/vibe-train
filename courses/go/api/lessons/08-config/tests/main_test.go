package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func resetState() {
	mu.Lock()
	tasks = []Task{}
	nextID = 1
	mu.Unlock()
	requestCounter.Store(0)
	os.Remove(dataFile)
}

func TestLoadConfigDefaults(t *testing.T) {
	// Unset env vars to test defaults
	os.Unsetenv("PORT")
	os.Unsetenv("DATA_FILE")

	cfg := loadConfig()

	if cfg.Port != "8080" {
		t.Errorf("Expected default port %q, got %q", "8080", cfg.Port)
	}
	if cfg.DataFile != "tasks.json" {
		t.Errorf("Expected default data file %q, got %q", "tasks.json", cfg.DataFile)
	}
}

func TestLoadConfigFromEnv(t *testing.T) {
	os.Setenv("PORT", "3000")
	os.Setenv("DATA_FILE", "custom.json")
	defer os.Unsetenv("PORT")
	defer os.Unsetenv("DATA_FILE")

	cfg := loadConfig()

	if cfg.Port != "3000" {
		t.Errorf("Expected port %q from env, got %q", "3000", cfg.Port)
	}
	if cfg.DataFile != "custom.json" {
		t.Errorf("Expected data file %q from env, got %q", "custom.json", cfg.DataFile)
	}
}

func TestConfigStruct(t *testing.T) {
	cfg := Config{
		Port:     "9090",
		DataFile: "test.json",
	}

	if cfg.Port != "9090" {
		t.Errorf("Expected port %q, got %q", "9090", cfg.Port)
	}
	if cfg.DataFile != "test.json" {
		t.Errorf("Expected data file %q, got %q", "test.json", cfg.DataFile)
	}
}

func TestServerStillWorks(t *testing.T) {
	resetState()
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
