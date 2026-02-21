# Lesson 4: Your First Component

## Objectives

- Write your first Solid.js JSX component
- Render props as dynamic text and attributes
- Use `@solidjs/testing-library` to test components

## Concepts

### JSX in Solid.js

Solid uses JSX to describe UI. Unlike React, JSX compiles to real DOM operations — no virtual DOM.

```jsx
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

### Props are accessed via `props.xxx`

In Solid, you access props on the `props` object. Don't destructure props — it breaks reactivity.

```jsx
// Good
function Card(props) {
  return <div class="card">{props.title}</div>;
}

// Bad — breaks reactivity
function Card({ title }) {
  return <div class="card">{title}</div>;
}
```

### Conditional classes

```jsx
<span class={props.status === "good" ? "badge-good" : "badge-bad"}>
  {props.status}
</span>
```

## Instructions

1. Open `StatsCard.jsx`
2. Implement `StatsCard(props)` that renders:
   - A `<div>` with `class="stats-card"`
   - Inside: a `<h3>` with `props.label`, a `<p class="stats-value">` with `props.value`, and if `props.unit` is provided, a `<span class="stats-unit">` with the unit
3. Implement `HealthBadge(props)` that renders:
   - A `<span>` with `class="badge badge-<status>"` (e.g. `badge-good`, `badge-warning`)
   - Text content is `props.status`

## Validate Your Work

```bash
make test-lesson N=4
```

## Hints

<details>
<summary>Hint 1: Conditional rendering of unit</summary>

```jsx
{props.unit && <span class="stats-unit">{props.unit}</span>}
```

</details>

<details>
<summary>Hint 2: Dynamic class for HealthBadge</summary>

```jsx
<span class={`badge badge-${props.status}`}>
```

</details>

## Key Takeaways

- Solid components are plain functions that return JSX
- Don't destructure props — use `props.xxx` to maintain reactivity
- JSX compiles to real DOM — no re-renders, just targeted updates

## Next

Continue to [Lesson 5: Props & Composition](../05-props-children/).
