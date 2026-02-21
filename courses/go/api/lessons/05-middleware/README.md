# Lesson 5: Middleware

## Objectives

- Understand the middleware pattern in Go
- Implement logging and request ID middleware
- Chain multiple middlewares together

## Concepts

### What is middleware?

Middleware wraps an HTTP handler to add behavior before or after the handler runs. In Go, middleware is a function that takes a handler and returns a new handler:

```go
type Middleware func(http.Handler) http.Handler
```

### Writing middleware

```go
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
    })
}
```

### Chaining middleware

Apply multiple middlewares by wrapping them in reverse order:

```go
func chain(handler http.Handler, middlewares ...Middleware) http.Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        handler = middlewares[i](handler)
    }
    return handler
}
```

### Atomic counters

Use `sync/atomic` for thread-safe counters:

```go
var counter atomic.Int64
id := counter.Add(1)
```

## Instructions

1. Open `starter/main.go`
2. Define the `Middleware` type
3. Implement `chain()` to apply middlewares in order
4. Implement `loggingMiddleware` — logs method, path, and duration
5. Implement `requestIDMiddleware` — adds `X-Request-ID` header
6. Implement `newHandler()` that chains the middlewares around the mux
7. Update `main()` to use `newHandler()` instead of `newMux()`

### Files to edit

- `starter/main.go` — Implement middleware functions and chaining

## Validate Your Work

```bash
make test-lesson N=5
```

## Hints

<details>
<summary>Hint 1: Middleware signature</summary>

Each middleware returns `http.HandlerFunc(func(w, r) { ... })` wrapped in `http.Handler`. Don't forget to call `next.ServeHTTP(w, r)` to pass control to the next handler.

</details>

<details>
<summary>Hint 2: Request ID</summary>

```go
id := requestCounter.Add(1)
w.Header().Set("X-Request-ID", fmt.Sprintf("%d", id))
```

Set the header **before** calling `next.ServeHTTP`.

</details>

## Key Takeaways

- Middleware is a powerful pattern for cross-cutting concerns
- The order of middleware matters — first in the chain runs first
- `http.Handler` and `http.HandlerFunc` are the key interfaces
- Use `sync/atomic` for thread-safe counters

## Next

Continue to [Lesson 6: File Persistence](../06-persistence/).
