import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createDashboardStore } from "./dashboard-store.js";

describe("createDashboardStore", () => {
  it("has 3 initial widgets", () => {
    createRoot((dispose) => {
      const { state } = createDashboardStore();
      expect(state.widgets).toHaveLength(3);
      expect(state.widgets[0].id).toBe("weather");
      expect(state.widgets[1].id).toBe("tasks");
      expect(state.widgets[2].id).toBe("stats");
      dispose();
    });
  });

  it("all widgets start visible", () => {
    createRoot((dispose) => {
      const { state } = createDashboardStore();
      state.widgets.forEach((w) => {
        expect(w.visible).toBe(true);
      });
      dispose();
    });
  });

  it("starts with empty tasks", () => {
    createRoot((dispose) => {
      const { state } = createDashboardStore();
      expect(state.tasks).toHaveLength(0);
      dispose();
    });
  });

  it("toggles widget visibility", () => {
    createRoot((dispose) => {
      const { state, toggleWidget } = createDashboardStore();
      expect(state.widgets[0].visible).toBe(true);

      toggleWidget("weather");
      expect(state.widgets[0].visible).toBe(false);

      toggleWidget("weather");
      expect(state.widgets[0].visible).toBe(true);
      dispose();
    });
  });

  it("updates widget data", () => {
    createRoot((dispose) => {
      const { state, updateWidgetData } = createDashboardStore();
      updateWidgetData("weather", { temp: 72, unit: "F" });
      expect(state.widgets[0].data.temp).toBe(72);
      expect(state.widgets[0].data.unit).toBe("F");

      updateWidgetData("weather", { temp: 80 });
      expect(state.widgets[0].data.temp).toBe(80);
      expect(state.widgets[0].data.unit).toBe("F");
      dispose();
    });
  });

  it("adds a task", () => {
    createRoot((dispose) => {
      const { state, addTask } = createDashboardStore();
      addTask("Buy groceries");
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].title).toBe("Buy groceries");
      expect(state.tasks[0].done).toBe(false);

      addTask("Walk the dog");
      expect(state.tasks).toHaveLength(2);
      dispose();
    });
  });

  it("removes a task", () => {
    createRoot((dispose) => {
      const { state, addTask, removeTask } = createDashboardStore();
      addTask("Task A");
      addTask("Task B");
      const idToRemove = state.tasks[0].id;

      removeTask(idToRemove);
      expect(state.tasks).toHaveLength(1);
      expect(state.tasks[0].title).toBe("Task B");
      dispose();
    });
  });
});
