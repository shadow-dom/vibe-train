# Lesson 6: File Persistence

## Objectives

- Save task data to a JSON file
- Load task data from a file on startup
- Handle the case where no data file exists yet

## Concepts

### Writing JSON to a file

```go
data, err := json.MarshalIndent(tasks, "", "  ")
if err != nil {
    return err
}
os.WriteFile("tasks.json", data, 0644)
```

### Reading JSON from a file

```go
data, err := os.ReadFile("tasks.json")
if os.IsNotExist(err) {
    // File doesn't exist yet — that's fine
    return nil
}
json.Unmarshal(data, &tasks)
```

### Tracking the next ID

After loading tasks, find the highest existing ID so new tasks get unique IDs:

```go
for _, task := range tasks {
    if task.ID >= nextID {
        nextID = task.ID + 1
    }
}
```

## Instructions

1. Open `starter/main.go`
2. Implement `saveTasks()` — marshals tasks and writes to the data file
3. Implement `loadTasks()` — reads the data file and unmarshals tasks
4. Call `saveTasks()` after create, update, and delete operations
5. Call `loadTasks()` at the start of `main()`

### Files to edit

- `starter/main.go` — Implement save/load persistence

## Validate Your Work

```bash
make test-lesson N=6
```

## Hints

<details>
<summary>Hint 1: Handling missing files</summary>

```go
if os.IsNotExist(err) {
    tasks = []Task{}
    return nil
}
```

</details>

<details>
<summary>Hint 2: Async saves</summary>

For update and delete (which hold the mutex with `defer mu.Unlock()`), use `go saveTasks()` to save asynchronously after the mutex is released.

</details>

## Key Takeaways

- `os.WriteFile` and `os.ReadFile` are simple file I/O helpers
- `json.MarshalIndent` produces human-readable JSON files
- Always handle the "file not found" case gracefully
- After loading data, recalculate auto-increment IDs

## Next

Continue to [Lesson 7: Testing](../07-testing/).
