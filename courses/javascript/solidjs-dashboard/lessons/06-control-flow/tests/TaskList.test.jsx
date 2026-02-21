import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { TaskList, StatusIcon } from "./TaskList.jsx";

afterEach(cleanup);

describe("TaskList", () => {
  it("shows empty message when there are no tasks", () => {
    const [tasks] = createSignal([]);
    render(() => <TaskList tasks={tasks} />);
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("renders task items", () => {
    const [tasks] = createSignal([
      { id: 1, title: "Buy groceries", done: false },
      { id: 2, title: "Walk the dog", done: true },
    ]);
    render(() => <TaskList tasks={tasks} />);
    expect(screen.getByText("Buy groceries")).toBeInTheDocument();
    expect(screen.getByText("Walk the dog")).toBeInTheDocument();
  });

  it("applies task-done class to completed tasks", () => {
    const [tasks] = createSignal([
      { id: 1, title: "Done task", done: true },
      { id: 2, title: "Open task", done: false },
    ]);
    render(() => <TaskList tasks={tasks} />);
    const doneItem = screen.getByText("Done task");
    const openItem = screen.getByText("Open task");
    expect(doneItem.className).toContain("task-done");
    expect(openItem.className).not.toContain("task-done");
  });

  it("does not show empty message when tasks exist", () => {
    const [tasks] = createSignal([
      { id: 1, title: "Task 1", done: false },
    ]);
    render(() => <TaskList tasks={tasks} />);
    expect(screen.queryByText("No tasks yet")).toBeNull();
  });
});

describe("StatusIcon", () => {
  it("renders success icon", () => {
    render(() => <StatusIcon status="success" />);
    const icon = screen.getByText("✓");
    expect(icon).toBeInTheDocument();
    expect(icon.className).toContain("icon-success");
  });

  it("renders warning icon", () => {
    render(() => <StatusIcon status="warning" />);
    const icon = screen.getByText("⚠");
    expect(icon).toBeInTheDocument();
    expect(icon.className).toContain("icon-warning");
  });

  it("renders error icon", () => {
    render(() => <StatusIcon status="error" />);
    const icon = screen.getByText("✗");
    expect(icon).toBeInTheDocument();
    expect(icon.className).toContain("icon-error");
  });
});
