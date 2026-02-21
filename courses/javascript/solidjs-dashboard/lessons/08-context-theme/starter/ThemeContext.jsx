import { createContext, createSignal, useContext } from "solid-js";

// TODO: Create ThemeContext with createContext()

/**
 * Provider that supplies theme state to descendants.
 * Default theme is "light".
 */
export function ThemeProvider(props) {
  // TODO: Create a signal for the theme (default "light")
  // TODO: Create a toggleTheme function that switches between "light" and "dark"
  // TODO: Provide { theme, setTheme, toggleTheme } via ThemeContext.Provider
  // TODO: Render props.children inside the provider
}

/**
 * Hook to consume the theme context.
 * Throws if used outside of ThemeProvider.
 */
export function useTheme() {
  // TODO: Call useContext(ThemeContext)
  // TODO: Throw an error if context is undefined
  // TODO: Return the context value
}

/**
 * A button that toggles between light and dark themes.
 */
export function ThemeToggle() {
  // TODO: Use useTheme() to get theme and toggleTheme
  // TODO: Render a <button> that calls toggleTheme on click
  //   - Text: "Switch to dark" or "Switch to light" (opposite of current)
}
