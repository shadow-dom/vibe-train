# Vibe Train

A test-driven learning platform where students build real projects one lesson at a time. Each lesson has starter code with TODOs, a test suite, and a reference solution. Students write code until the tests pass, then move to the next lesson.

Courses can be taken via the CLI (`make test-lesson`) or through the web platform with an in-browser code editor and live test runner.

## Project Structure

```
vibe-train/
  _template/          # Starter template for new courses
  courses/            # All course content
    go/api/           # Example: "Build a Task Manager REST API in Go"
      course.yaml     # Course metadata
      shared/         # Shared files (go.mod, deps, etc.)
      lessons/
        01-hello-http/
          README.md   # Lesson content (concepts, instructions, hints)
          starter/    # Starter code with TODOs
          solution/   # Reference solution
          tests/      # Test suite that validates the code
  web/                # Web platform
    runner/           # Go backend — serves course content + runs tests
    frontend/         # React SPA — Monaco editor, markdown rendering
    docker-compose.yml
```

## Running the Web Platform

### With Docker

```bash
cd web
docker compose up --build
# Open http://localhost:3000
```

### Dev Mode

```bash
# Terminal 1: Start the backend
cd web/runner
go run . --courses-root ../../courses

# Terminal 2: Start the frontend (proxies API to runner)
cd web/frontend
npm install
npm run dev
```

## CLI Usage

You can also work through courses directly in the terminal:

```bash
cd courses/go/api

# Test your starter code for lesson 1
make test-lesson N=1

# Test all lessons in order
make test-all

# Verify a solution is correct
make validate-solution N=1
```

## Creating a New Course

### 1. Copy the template

```bash
cp -r _template courses/<language>/<course-name>
```

### 2. Fill in `course.yaml`

```yaml
id: "go-api"                      # Unique identifier
title: "Build a REST API in Go"
description: "..."
language: go                       # go | rust | javascript | typescript | python | kubernetes | shell
difficulty: beginner               # beginner | intermediate | advanced
estimated_hours: 8
prerequisites:
  - "Basic Go syntax"
tags: [go, rest-api]

runtime:
  check: "go version"
  min_version: "1.22"

dependencies:
  strategy: shared                 # shared = one go.mod/package.json for all lessons
  install: "go mod tidy"

lesson_mode: cumulative            # cumulative = later lessons build on earlier ones

lessons:
  - slug: 01-hello-http
    title: "Hello, HTTP Server"
  - slug: 02-routing
    title: "Routing & Methods"
```

### 3. Set up shared dependencies

Put shared files (e.g., `go.mod`, `package.json`) in the `shared/` directory. These are copied into the test workspace before every test run.

### 4. Create lessons

Each lesson lives in `lessons/<slug>/` with this structure:

```
lessons/01-hello-http/
  README.md       # Lesson content
  starter/        # Code with TODOs for the student to fill in
    main.go
  solution/       # Working reference implementation
    main.go
  tests/          # Test suite
    main_test.go
```

**Starter code** should compile but have TODO comments where the student needs to write code. Tests should fail against the starter and pass against the solution.

**README.md** should follow this structure:
- Objectives — what the student will learn
- Concepts — key ideas with code examples
- Instructions — step-by-step what to implement
- Validate Your Work — the `make test-lesson` command and expected output
- Hints — collapsible `<details>` blocks with progressive guidance
- Key Takeaways — summary of what was learned

### 5. Validate your course

```bash
cd courses/<language>/<course-name>

# Verify each solution passes its tests
make validate-solution N=1
make validate-solution N=2
# ...or all at once:
make test-all
```

## Supported Languages

The test runner (`validate.sh`) supports:

| Language | Test Command |
|----------|-------------|
| Go | `go test -v -count=1 ./...` |
| Rust | `cargo test` |
| JavaScript/TypeScript | `npm test` |
| Python | `python -m pytest -v` |
| Kubernetes/Shell | `bash tests/validate.sh` |

You can override the test command per-course by setting `test_runner` in `course.yaml`.
