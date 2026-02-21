# Lesson 5: Props & Composition

## Objectives

- Use `mergeProps` for default prop values
- Use `splitProps` to separate component-specific props from forwarded attributes
- Use `children` to compose components with child elements

## Concepts

### Default props with mergeProps

```jsx
import { mergeProps } from "solid-js";

function Card(props) {
  const merged = mergeProps({ color: "blue" }, props);
  return <div style={{ color: merged.color }}>{merged.title}</div>;
}
```

### Splitting props with splitProps

```jsx
import { splitProps } from "solid-js";

function Button(props) {
  const [local, others] = splitProps(props, ["label", "onClick"]);
  return <button onClick={local.onClick} {...others}>{local.label}</button>;
}
```

### Rendering children

```jsx
function Wrapper(props) {
  return <div class="wrapper">{props.children}</div>;
}

// Usage: <Wrapper><p>Hello</p></Wrapper>
```

## Instructions

1. Open `DashboardCard.jsx`
2. Implement `DashboardCard(props)`:
   - Renders a `<div class="dashboard-card">` with a `<h2>` for `props.title` and `props.children` below it
3. Implement `DashboardGrid(props)`:
   - Renders a `<div class="dashboard-grid">` with `props.children`
   - Uses `mergeProps` to default `columns` to `3`
   - Sets `style={{ "grid-template-columns": \`repeat(\${merged.columns}, 1fr)\` }}`
4. Implement `IconLabel(props)`:
   - Uses `splitProps` to separate `["icon", "label"]` from other props
   - Renders `<span class="icon-label" {...others}>` containing the icon and label text

## Validate Your Work

```bash
make test-lesson N=5
```

## Hints

<details>
<summary>Hint 1: mergeProps usage</summary>

```jsx
const merged = mergeProps({ columns: 3 }, props);
```

</details>

<details>
<summary>Hint 2: splitProps usage</summary>

```jsx
const [local, others] = splitProps(props, ["icon", "label"]);
return <span {...others}>{local.icon} {local.label}</span>;
```

</details>

## Key Takeaways

- `mergeProps` safely provides default values without breaking reactivity
- `splitProps` cleanly separates local props from forwarded attributes
- `props.children` works just like in other JSX frameworks

## Next

Continue to [Lesson 6: Lists & Conditional Rendering](../06-control-flow/).
