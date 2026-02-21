import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createRoot } from "solid-js";
import { ThemeProvider, useTheme, ThemeToggle } from "./ThemeContext.jsx";

afterEach(cleanup);

describe("ThemeProvider", () => {
  it("provides a default theme of light", () => {
    function Consumer() {
      const { theme } = useTheme();
      return <span>{theme()}</span>;
    }

    render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    expect(screen.getByText("light")).toBeInTheDocument();
  });

  it("toggles theme to dark", async () => {
    function Consumer() {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{theme()}</span>
          <button onClick={toggleTheme}>toggle</button>
        </div>
      );
    }

    render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    expect(screen.getByTestId("theme").textContent).toBe("light");
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("allows setTheme to set directly", () => {
    function Consumer() {
      const { theme, setTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{theme()}</span>
          <button onClick={() => setTheme("dark")}>go dark</button>
        </div>
      );
    }

    render(() => (
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    ));

    fireEvent.click(screen.getByText("go dark"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });
});

describe("useTheme", () => {
  it("throws when used outside ThemeProvider", () => {
    expect(() => {
      createRoot((dispose) => {
        try {
          useTheme();
        } finally {
          dispose();
        }
      });
    }).toThrow();
  });
});

describe("ThemeToggle", () => {
  it("renders a button with correct text", () => {
    render(() => (
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    ));
    expect(screen.getByText("Switch to dark")).toBeInTheDocument();
  });

  it("changes text after click", () => {
    render(() => (
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    ));

    const button = screen.getByText("Switch to dark");
    fireEvent.click(button);
    expect(screen.getByText("Switch to light")).toBeInTheDocument();
  });
});
