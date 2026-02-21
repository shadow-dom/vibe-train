# Lesson 4: Error Handling

## Objectives

- Return consistent JSON error responses instead of plain text
- Validate required fields and enum values
- Create reusable helper functions for JSON responses

## Concepts

### Consistent error format

Instead of `http.Error()` which returns plain text, return structured JSON errors:

```go
type ErrorResponse struct {
    Error string `json:"error"`
}
```

### Helper functions

Extract repetitive response logic into helpers:

```go
func writeJSON(w http.ResponseWriter, status int, v interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
    writeJSON(w, status, ErrorResponse{Error: message})
}
```

### Input validation

Validate user input before processing:

```go
if input.Title == "" {
    writeError(w, http.StatusBadRequest, "title is required")
    return
}
```

### Status enum validation

Use a map to validate allowed values:

```go
var validStatuses = map[string]bool{
    "todo": true, "in_progress": true, "done": true,
}

if !validStatuses[status] {
    writeError(w, http.StatusBadRequest, "invalid status")
    return
}
```

## Instructions

1. Open `starter/main.go`
2. Define the `ErrorResponse` struct and `validStatuses` map
3. Implement `writeJSON` and `writeError` helper functions
4. Add title validation to `handleCreateTask`
5. Add title and status validation to `handleUpdateTask`

### Files to edit

- `starter/main.go` — Add error types, helpers, and validation

## Validate Your Work

```bash
make test-lesson N=4
```

## Hints

<details>
<summary>Hint 1: ErrorResponse struct</summary>

```go
type ErrorResponse struct {
    Error string `json:"error"`
}
```

</details>

<details>
<summary>Hint 2: Checking valid statuses</summary>

```go
var validStatuses = map[string]bool{
    "todo": true, "in_progress": true, "done": true,
}
// Then check: if !validStatuses[*input.Status] { ... }
```

</details>

## Key Takeaways

- Always return JSON error responses from a JSON API
- Helper functions reduce duplication and ensure consistency
- Validate inputs early and return clear error messages
- Use maps for enum validation

## Next

Continue to [Lesson 5: Middleware](../05-middleware/).
