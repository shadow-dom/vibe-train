import { createContext, createSignal, useContext } from "solid-js";

const ThemeContext = createContext();

/**
 * Provider that supplies theme state to descendants.
 */
export function ThemeProvider(props) {
  const [theme, setTheme] = createSignal("light");

  const toggleTheme = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to consume the theme context.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

/**
 * A button that toggles between light and dark themes.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}>
      Switch to {theme() === "light" ? "dark" : "light"}
    </button>
  );
}
