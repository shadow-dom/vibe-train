# Lesson 2: Derived State & Memos

## Objectives

- Use `createMemo` to derive computed values from signals
- Build dashboard statistics that automatically update when data changes
- Understand when to use memos vs plain functions

## Concepts

When you need a value that depends on one or more signals, you can use `createMemo`. A memo caches its result and only recomputes when its dependencies change.

### Creating a memo

```js
import { createSignal, createMemo } from "solid-js";

const [items, setItems] = createSignal([1, 2, 3]);
const total = createMemo(() => items().reduce((sum, n) => sum + n, 0));
total(); // 6
```

### Memo vs plain function

A plain function recomputes every time it's called. A memo only recomputes when its reactive dependencies change — useful when the computation is expensive or read in multiple places.

## Instructions

1. Open `dashboard-stats.js`
2. Implement `createDashboardStats(dataSignal)` that takes a signal getter returning an array of numbers
3. Return an object with memo getters: `{ total, average, min, max, count }`
   - `total` — sum of all values
   - `average` — mean of all values (0 for empty arrays)
   - `min` — minimum value (0 for empty arrays)
   - `max` — maximum value (0 for empty arrays)
   - `count` — number of values
4. Each should be a `createMemo` so values are cached

## Validate Your Work

```bash
make test-lesson N=2
```

## Hints

<details>
<summary>Hint 1: Using createMemo</summary>

```js
const total = createMemo(() => {
  const data = dataSignal();
  return data.reduce((sum, n) => sum + n, 0);
});
```

</details>

<details>
<summary>Hint 2: Handling empty arrays</summary>

Check `data.length === 0` and return 0 to avoid `NaN` from division or `Infinity` from `Math.min()`.

</details>

## Key Takeaways

- `createMemo` caches derived values and only recomputes when dependencies change
- Always handle edge cases like empty arrays in your memos
- Memos are signal getters — call them with `()` to read the value

## Next

Continue to [Lesson 3: Effects & Lifecycle](../03-effects/).
