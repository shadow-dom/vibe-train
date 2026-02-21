# Lesson 2: Routing & Methods

## Objectives

- Register multiple routes with different HTTP methods
- Parse JSON request bodies
- Return JSON responses with proper status codes
- Use a mutex to protect shared state

## Concepts

### HTTP Methods

Go 1.22+ lets you specify the HTTP method directly in the route pattern:

```go
mux.HandleFunc("GET /tasks", handleList)
mux.HandleFunc("POST /tasks", handleCreate)
```

### Decoding JSON

```go
var input struct {
    Title string `json:"title"`
}
json.NewDecoder(r.Body).Decode(&input)
```

### Encoding JSON

```go
w.Header().Set("Content-Type", "application/json")
w.WriteHeader(http.StatusCreated)
json.NewEncoder(w).Encode(task)
```

### Protecting shared state

When multiple requests access the same data concurrently, use a `sync.Mutex`:

```go
mu.Lock()
// modify shared data
mu.Unlock()
```

## Instructions

1. Open `starter/main.go`
2. Register handlers for `POST /tasks` and `GET /tasks`
3. Implement `handleCreateTask` to decode JSON, create a task, and return it
4. Implement `handleListTasks` to return all tasks as JSON

### Files to edit

- `starter/main.go` — Implement task creation and listing

## Validate Your Work

```bash
make test-lesson N=2
```

## Hints

<details>
<summary>Hint 1: Registering routes</summary>

```go
mux.HandleFunc("POST /tasks", handleCreateTask)
mux.HandleFunc("GET /tasks", handleListTasks)
```

</details>

<details>
<summary>Hint 2: Creating a task</summary>

Don't forget to lock/unlock the mutex, increment `nextID`, and set the status code to `http.StatusCreated` (201).

</details>

## Key Takeaways

- Go 1.22+ supports method-based routing in `http.ServeMux`
- `json.NewDecoder` reads from an `io.Reader` (like `r.Body`)
- `json.NewEncoder` writes to an `io.Writer` (like `http.ResponseWriter`)
- Use `sync.Mutex` to protect concurrent access to shared data

## Next

Continue to [Lesson 3: JSON & CRUD](../03-json-crud/).
