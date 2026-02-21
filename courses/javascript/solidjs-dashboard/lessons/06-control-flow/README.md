# Lesson 6: Lists & Conditional Rendering

## Objectives

- Use `<For>` to efficiently render lists
- Use `<Show>` for conditional rendering
- Use `<Switch>` and `<Match>` for multi-branch conditions

## Concepts

### Rendering lists with For

```jsx
import { For } from "solid-js";

<For each={items()}>
  {(item) => <li>{item.name}</li>}
</For>
```

`<For>` efficiently updates only the changed items — no key prop needed.

### Conditional rendering with Show

```jsx
import { Show } from "solid-js";

<Show when={items().length > 0} fallback={<p>No items yet</p>}>
  <ul>...</ul>
</Show>
```

### Multi-branch with Switch/Match

```jsx
import { Switch, Match } from "solid-js";

<Switch>
  <Match when={status() === "loading"}>Loading...</Match>
  <Match when={status() === "error"}>Error!</Match>
  <Match when={status() === "ready"}>Ready!</Match>
</Switch>
```

## Instructions

1. Open `TaskList.jsx`
2. Implement `TaskList(props)`:
   - `props.tasks` is a signal getter returning an array of `{ id, title, done }` objects
   - Use `<Show>` with a `fallback` of `<p class="empty-message">No tasks yet</p>` when the array is empty
   - Use `<For>` to render each task as `<li class="task-item">` containing the title
   - Add class `"task-done"` to the `<li>` when `task.done` is true
3. Implement `StatusIcon(props)`:
   - `props.status` is a string: `"success"`, `"warning"`, or `"error"`
   - Use `<Switch>` and `<Match>` to render the appropriate icon span
   - `"success"` → `<span class="icon-success">✓</span>`
   - `"warning"` → `<span class="icon-warning">⚠</span>`
   - `"error"` → `<span class="icon-error">✗</span>`

## Validate Your Work

```bash
make test-lesson N=6
```

## Hints

<details>
<summary>Hint 1: Show with fallback</summary>

```jsx
<Show when={props.tasks().length > 0} fallback={<p class="empty-message">No tasks yet</p>}>
  <ul>
    <For each={props.tasks()}>
      {(task) => <li>...</li>}
    </For>
  </ul>
</Show>
```

</details>

<details>
<summary>Hint 2: Conditional classes</summary>

```jsx
<li class={`task-item${task.done ? " task-done" : ""}`}>
```

</details>

## Key Takeaways

- `<For>` is the idiomatic way to render lists in Solid — it keyed by reference automatically
- `<Show>` replaces `{condition && ...}` with a clearer, more efficient pattern
- `<Switch>`/`<Match>` handles multiple exclusive conditions cleanly

## Next

Continue to [Lesson 7: Stores & Complex State](../07-stores/).
