# Lesson 3: Effects & Lifecycle

## Objectives

- Use `createEffect` to run side effects when signals change
- Use `onCleanup` to clean up resources like intervals
- Build an activity log and auto-refresh utility

## Concepts

### Effects

`createEffect` runs a function whenever its reactive dependencies change:

```js
import { createEffect, createSignal } from "solid-js";

const [name, setName] = createSignal("Alice");
createEffect(() => {
  console.log("Name changed to:", name());
});
```

### Cleanup

`onCleanup` registers a function that runs before an effect re-executes or when its owner is disposed:

```js
import { createEffect, onCleanup } from "solid-js";

createEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  onCleanup(() => clearInterval(id));
});
```

## Instructions

1. Open `activity-log.js`
2. Implement `createActivityLog()` that returns `{ log, track, clear }`
   - `log` — a signal getter returning an array of log entries (strings)
   - `track(signal, label)` — uses `createEffect` with `on(signal, cb, { defer: true })` to push `"<label>: <value>"` to the log whenever the signal changes (skipping the initial value)
   - `clear()` — empties the log
3. Implement `createAutoRefresh(callback, intervalMs)` that:
   - Calls `callback` immediately, then every `intervalMs` milliseconds
   - Uses `onCleanup` to clear the interval when disposed

## Validate Your Work

```bash
make test-lesson N=3
```

## Hints

<details>
<summary>Hint 1: Skipping the initial effect run</summary>

Use `on()` with `defer: true` to skip the first execution:

```js
import { on } from "solid-js";

createEffect(
  on(signal, (value) => {
    // This only runs when signal changes, not on initial setup
  }, { defer: true })
);
```

</details>

<details>
<summary>Hint 2: Auto-refresh cleanup</summary>

```js
const id = setInterval(callback, intervalMs);
onCleanup(() => clearInterval(id));
```

</details>

## Key Takeaways

- `createEffect` automatically tracks which signals you read inside it
- `onCleanup` prevents memory leaks from timers, subscriptions, etc.
- Effects run after the current reactive update batch completes

## Next

Continue to [Lesson 4: Your First Component](../04-first-component/).
