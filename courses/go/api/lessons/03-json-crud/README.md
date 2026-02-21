# Lesson 3: JSON & CRUD

## Objectives

- Implement full CRUD operations (Create, Read, Update, Delete)
- Extract path parameters using `r.PathValue()`
- Use pointer fields for partial updates
- Return appropriate HTTP status codes for each operation

## Concepts

### Path parameters

Go 1.22+ supports path parameters in route patterns:

```go
mux.HandleFunc("GET /tasks/{id}", handleGetTask)
```

Extract the value inside the handler:

```go
id := r.PathValue("id")
```

### Pointer fields for optional updates

Use pointer types to distinguish between "not provided" and "set to zero value":

```go
var input struct {
    Title  *string `json:"title"`
    Status *string `json:"status"`
}
// After decoding, check: if input.Title != nil { ... }
```

### HTTP status codes

| Operation | Success Code |
|-----------|-------------|
| GET (found) | 200 OK |
| PUT (updated) | 200 OK |
| DELETE | 204 No Content |
| Not found | 404 Not Found |

## Instructions

1. Open `starter/main.go`
2. Register the three new route handlers in `newMux()`
3. Implement `handleGetTask` — find a task by ID and return it
4. Implement `handleUpdateTask` — update a task's title and/or status
5. Implement `handleDeleteTask` — remove a task from the slice

### Files to edit

- `starter/main.go` — Implement GET, PUT, DELETE for individual tasks

## Validate Your Work

```bash
make test-lesson N=3
```

## Hints

<details>
<summary>Hint 1: Parsing the ID</summary>

```go
id, err := strconv.Atoi(r.PathValue("id"))
if err != nil {
    http.Error(w, "invalid id", http.StatusBadRequest)
    return
}
```

</details>

<details>
<summary>Hint 2: Removing from a slice</summary>

```go
tasks = append(tasks[:i], tasks[i+1:]...)
```

</details>

## Key Takeaways

- `r.PathValue("id")` extracts named segments from the URL path
- Use pointer fields (`*string`) to handle partial JSON updates
- `204 No Content` is the standard response for successful deletes
- Always lock the mutex before accessing shared data

## Next

Continue to [Lesson 4: Error Handling](../04-error-handling/).
