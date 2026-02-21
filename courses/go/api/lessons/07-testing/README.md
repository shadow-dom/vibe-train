# Lesson 7: Testing

## Objectives

- Write table-driven tests for HTTP endpoints
- Use `httptest.NewServer` to test handlers
- Create test helper functions
- Test both success and error paths

## Concepts

### Table-driven tests

Go's idiomatic testing pattern uses a slice of test cases:

```go
tests := []struct {
    name       string
    method     string
    path       string
    body       string
    wantStatus int
}{
    {"create task", "POST", "/tasks", `{"title":"Test"}`, 201},
    {"list tasks", "GET", "/tasks", "", 200},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        // test logic here
    })
}
```

### httptest.NewServer

Create a real HTTP server for testing:

```go
srv := httptest.NewServer(newHandler())
defer srv.Close()

resp, err := http.Get(srv.URL + "/health")
```

### Test helpers

Use `t.Helper()` to mark functions as test helpers so error messages show the caller's line:

```go
func makeRequest(t *testing.T, srv *httptest.Server, method, path, body string) *http.Response {
    t.Helper()
    req, _ := http.NewRequest(method, srv.URL+path, strings.NewReader(body))
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        t.Fatalf("request failed: %v", err)
    }
    return resp
}
```

## Instructions

1. Open `starter/main_test.go` (note: this lesson you edit the **test** file)
2. The `resetState()` and `makeRequest()` helpers are provided
3. Implement `TestCRUDOperations` — table-driven tests for all CRUD operations
4. Implement `TestValidationErrors` — table-driven tests for error cases

### Files to edit

- `tests/main_test.go` — Implement the table-driven test functions

## Validate Your Work

```bash
make test-lesson N=7
```

## Hints

<details>
<summary>Hint 1: Sequential test cases</summary>

For CRUD tests, the test cases run sequentially against the same server. So "create" happens before "get", which happens before "delete". This means you can create a task in one case and reference it by ID in the next.

</details>

<details>
<summary>Hint 2: Testing error messages</summary>

```go
var errResp ErrorResponse
json.NewDecoder(resp.Body).Decode(&errResp)
if !strings.Contains(errResp.Error, "expected text") {
    t.Errorf("unexpected error: %s", errResp.Error)
}
```

</details>

## Key Takeaways

- Table-driven tests are Go's idiomatic way to test multiple cases
- `httptest.NewServer` creates a real server for integration testing
- `t.Helper()` improves error message readability
- Test both happy paths and error cases

## Next

Continue to [Lesson 8: Configuration & Polish](../08-config/).
