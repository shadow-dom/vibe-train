# Lesson 1: Hello, HTTP Server

## Objectives

- Create a minimal HTTP server using Go's `net/http` package
- Handle a request and return a JSON response
- Understand `http.HandleFunc`, `http.ListenAndServe`, and `http.ResponseWriter`

## Concepts

Every web API starts with an HTTP server. In Go, the `net/http` package provides everything you need.

### Starting a server

```go
http.ListenAndServe(":8080", nil)
```

This starts a server on port 8080 using the default serve mux (router).

### Handling a route

```go
http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("Hello, world!"))
})
```

### Returning JSON

To return JSON, set the `Content-Type` header and write a JSON string:

```go
w.Header().Set("Content-Type", "application/json")
w.Write([]byte(`{"message":"hello"}`))
```

## Instructions

1. Open `starter/main.go`
2. Find the `TODO` comments
3. Implement a `/health` endpoint that returns `{"status":"ok"}` with a `200` status code
4. Set the `Content-Type` header to `application/json`
5. Start the server on port `8080`

### Files to edit

- `starter/main.go` — Implement the health endpoint and start the server

## Validate Your Work

```bash
make test-lesson N=1
```

Expected output:
```
==> Validating 01-hello-http (starter)
--- PASS: TestHealthEndpoint
PASS
==> PASS: 01-hello-http (starter)
```

## Hints

<details>
<summary>Hint 1: Setting up the handler</summary>

Use `http.HandleFunc("/health", yourHandlerFunction)` to register your handler before calling `ListenAndServe`.

</details>

<details>
<summary>Hint 2: Writing the JSON response</summary>

```go
w.Header().Set("Content-Type", "application/json")
w.WriteHeader(http.StatusOK)
w.Write([]byte(`{"status":"ok"}`))
```

</details>

## Key Takeaways

- `net/http` is all you need for a basic HTTP server in Go
- Always set `Content-Type` when returning JSON
- `http.ListenAndServe` blocks forever (or until an error)

## Next

Continue to [Lesson 2: Routing & Methods](../02-routing/).
