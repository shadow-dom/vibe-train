# Build a Task Manager REST API in Go

> Build a complete Task Manager REST API from scratch using only Go's standard library. No frameworks, no third-party routers — just `net/http` and your understanding of HTTP.

## Prerequisites

- Basic Go syntax (variables, functions, structs, slices)
- Familiarity with the command line
- Go 1.22+ installed

## Lessons

| # | Lesson | Topic |
|---|--------|-------|
| 1 | [Hello, HTTP Server](lessons/01-hello-http/) | Minimal HTTP server with a health endpoint |
| 2 | [Routing & Methods](lessons/02-routing/) | POST and GET endpoints for tasks |
| 3 | [JSON & CRUD](lessons/03-json-crud/) | Full CRUD with JSON encode/decode |
| 4 | [Error Handling](lessons/04-error-handling/) | Validation, error responses, status codes |
| 5 | [Middleware](lessons/05-middleware/) | Logging, request IDs, middleware chaining |
| 6 | [File Persistence](lessons/06-persistence/) | Save/load tasks from a JSON file |
| 7 | [Testing](lessons/07-testing/) | Table-driven tests with httptest |
| 8 | [Configuration & Polish](lessons/08-config/) | Environment config, structured logging, graceful shutdown |

## Getting Started

1. Ensure you have Go 1.22+ installed:
   ```bash
   go version
   ```

2. Start with [Lesson 1: Hello, HTTP Server](lessons/01-hello-http/).

## Validating Your Work

Run tests for a specific lesson:

```bash
make test-lesson N=1
```

Run all lesson tests:

```bash
make test-all
```

Course authors can verify solutions:

```bash
make validate-solution N=1
```
