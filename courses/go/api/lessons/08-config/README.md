# Lesson 8: Configuration & Polish

## Objectives

- Load configuration from environment variables with defaults
- Implement graceful shutdown with signal handling
- Save data on exit

## Concepts

### Environment-based configuration

Read settings from environment variables with sensible defaults:

```go
type Config struct {
    Port     string
    DataFile string
}

func loadConfig() Config {
    cfg := Config{Port: "8080", DataFile: "tasks.json"}
    if port := os.Getenv("PORT"); port != "" {
        cfg.Port = port
    }
    return cfg
}
```

### Graceful shutdown

Instead of `ListenAndServe` (which can't be stopped cleanly), use `http.Server` with signal handling:

```go
srv := &http.Server{Addr: ":8080", Handler: handler}

done := make(chan os.Signal, 1)
signal.Notify(done, os.Interrupt, syscall.SIGTERM)

go func() {
    srv.ListenAndServe()
}()

<-done // Wait for signal

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
srv.Shutdown(ctx)
```

### Save on exit

After shutting down the server, save any in-memory data before the process exits:

```go
<-done
srv.Shutdown(ctx)
saveTasks() // Persist data before exit
```

## Instructions

1. Open `starter/main.go`
2. Define the `Config` struct with `Port` and `DataFile` fields
3. Implement `loadConfig()` to read from environment variables
4. Replace the simple `ListenAndServe` with graceful shutdown
5. Save tasks before the process exits

### Files to edit

- `starter/main.go` — Add config loading and graceful shutdown

## Validate Your Work

```bash
make test-lesson N=8
```

## Hints

<details>
<summary>Hint 1: Reading environment variables</summary>

```go
if port := os.Getenv("PORT"); port != "" {
    cfg.Port = port
}
```

</details>

<details>
<summary>Hint 2: Signal handling</summary>

```go
done := make(chan os.Signal, 1)
signal.Notify(done, os.Interrupt, syscall.SIGTERM)
<-done // blocks until signal received
```

</details>

## Key Takeaways

- Environment variables are the standard way to configure server applications
- Always provide sensible defaults for configuration values
- Graceful shutdown lets in-flight requests complete before stopping
- Save persistent data before exit to prevent data loss

## Congratulations!

You've built a complete Task Manager REST API from scratch using only Go's standard library. You've learned HTTP servers, routing, JSON handling, error handling, middleware, file persistence, testing, and configuration.
