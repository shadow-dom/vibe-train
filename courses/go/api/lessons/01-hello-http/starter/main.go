package main

import (
	"fmt"
	"net/http"
)

func newMux() *http.ServeMux {
	mux := http.NewServeMux()

	// TODO: Register a handler for "GET /health" that returns a JSON response
	// with {"status":"ok"} and Content-Type set to "application/json".
	//
	// Use mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) { ... })
	//
	// Inside the handler:
	//   1. Set the Content-Type header: w.Header().Set("Content-Type", "application/json")
	//   2. Set the status code to 200: w.WriteHeader(http.StatusOK)
	//   3. Write the JSON body: w.Write([]byte(`{"status":"ok"}`))

	return mux
}

func main() {
	fmt.Println("Server starting on :8080")
	http.ListenAndServe(":8080", newMux())
}
