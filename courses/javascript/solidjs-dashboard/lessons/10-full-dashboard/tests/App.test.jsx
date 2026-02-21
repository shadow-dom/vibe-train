import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { Dashboard } from "./App.jsx";

afterEach(cleanup);

describe("Dashboard", () => {
  it("renders without crashing", () => {
    render(() => <Dashboard />);
  });

  it("renders the theme toggle button", () => {
    render(() => <Dashboard />);
    expect(screen.getByText("Switch to dark")).toBeInTheDocument();
  });

  it("renders all dashboard cards", async () => {
    render(() => <Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Weather")).toBeInTheDocument();
    });
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });

  it("can add a task", async () => {
    render(() => <Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Add Task")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add Task"));
    expect(screen.getByText("New Task")).toBeInTheDocument();
  });

  it("toggles theme", () => {
    render(() => <Dashboard />);
    const button = screen.getByText("Switch to dark");
    fireEvent.click(button);
    expect(screen.getByText("Switch to light")).toBeInTheDocument();
  });
});
