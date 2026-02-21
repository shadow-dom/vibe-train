# Lesson 7: Stores & Complex State

## Objectives

- Use `createStore` for nested, mutable-style state management
- Perform targeted mutations on deeply nested objects and arrays
- Understand the difference between signals and stores

## Concepts

### Creating a store

```js
import { createStore } from "solid-js/store";

const [state, setState] = createStore({
  user: { name: "Alice", age: 25 },
  items: [],
});
```

### Updating nested values

```js
// Update a nested property
setState("user", "name", "Bob");

// Push to an array
setState("items", (items) => [...items, { id: 1, name: "New Item" }]);

// Update by index
setState("items", 0, "name", "Updated Item");
```

### Stores vs Signals

- **Signals**: best for simple, flat values
- **Stores**: best for nested objects, arrays, or complex state trees

## Instructions

1. Open `dashboard-store.js`
2. Implement `createDashboardStore()` that returns `{ state, toggleWidget, updateWidgetData, addTask, removeTask }`
3. Initial state should have:
   - `widgets`: an array of 3 widgets: `{ id: "weather", title: "Weather", visible: true, data: {} }`, `{ id: "tasks", title: "Tasks", visible: true, data: {} }`, `{ id: "stats", title: "Stats", visible: true, data: {} }`
   - `tasks`: an empty array `[]`
4. Implement:
   - `toggleWidget(id)` — flips the `visible` boolean for the widget with that `id`
   - `updateWidgetData(id, data)` — merges `data` into the widget's `data` object
   - `addTask(title)` — pushes `{ id: nextId++, title, done: false }` to `tasks` (use a `let nextId = 1` counter)
   - `removeTask(id)` — filters out the task with that `id`

## Validate Your Work

```bash
make test-lesson N=7
```

## Hints

<details>
<summary>Hint 1: Toggling a widget</summary>

Find the widget index, then update it:

```js
function toggleWidget(id) {
  const idx = state.widgets.findIndex((w) => w.id === id);
  setState("widgets", idx, "visible", (v) => !v);
}
```

</details>

<details>
<summary>Hint 2: Removing a task</summary>

```js
function removeTask(id) {
  setState("tasks", (tasks) => tasks.filter((t) => t.id !== id));
}
```

</details>

## Key Takeaways

- `createStore` uses proxies for fine-grained reactive tracking
- Mutations are explicit via `setState` — you never mutate the proxy directly
- Path-based updates (`setState("a", "b", value)`) are efficient and precise

## Next

Continue to [Lesson 8: Context & Theme Toggle](../08-context-theme/).
