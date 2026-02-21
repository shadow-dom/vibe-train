# Lesson 8: Context & Theme Toggle

## Objectives

- Use `createContext` and `useContext` to share state across components
- Build a theme provider with light/dark toggle
- Understand the provider pattern in Solid.js

## Concepts

### Creating context

```jsx
import { createContext, useContext } from "solid-js";

const MyContext = createContext();

function MyProvider(props) {
  const value = { greeting: "hello" };
  return (
    <MyContext.Provider value={value}>
      {props.children}
    </MyContext.Provider>
  );
}

function useMyContext() {
  const ctx = useContext(MyContext);
  if (!ctx) throw new Error("useMyContext must be used within MyProvider");
  return ctx;
}
```

### Consuming context

Any descendant can call `useMyContext()` to access the shared value.

## Instructions

1. Open `ThemeContext.jsx`
2. Create a `ThemeContext` using `createContext()`
3. Implement `ThemeProvider(props)`:
   - Creates a signal for the current theme (default `"light"`)
   - Provides `{ theme, setTheme, toggleTheme }` via the context
   - `toggleTheme` switches between `"light"` and `"dark"`
4. Implement `useTheme()`:
   - Calls `useContext(ThemeContext)`
   - Throws an error if used outside a `ThemeProvider`
5. Implement `ThemeToggle()`:
   - Uses `useTheme()` to get the current theme and `toggleTheme`
   - Renders a `<button>` that calls `toggleTheme` on click
   - Button text: `"Switch to dark"` or `"Switch to light"` (the opposite of current theme)

## Validate Your Work

```bash
make test-lesson N=8
```

## Hints

<details>
<summary>Hint 1: Toggle function</summary>

```js
const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
```

</details>

<details>
<summary>Hint 2: Button text</summary>

```jsx
<button onClick={toggleTheme}>
  Switch to {theme() === "light" ? "dark" : "light"}
</button>
```

</details>

## Key Takeaways

- `createContext` + `useContext` provides dependency injection in Solid
- Always validate context usage with an error for missing providers
- The provider pattern keeps global state organized and testable

## Next

Continue to [Lesson 9: Async Data & Resources](../09-async-data/).
