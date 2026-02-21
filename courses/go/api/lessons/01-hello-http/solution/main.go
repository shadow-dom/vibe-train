package main

import (
	"fmt"
	"net/http"
)

func newMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	return mux
}

func main() {
	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", newMux())
}
