import { createStore } from "solid-js/store";

/**
 * Create a dashboard store with widgets and tasks.
 */
export function createDashboardStore() {
  let nextId = 1;

  const [state, setState] = createStore({
    widgets: [
      { id: "weather", title: "Weather", visible: true, data: {} },
      { id: "tasks", title: "Tasks", visible: true, data: {} },
      { id: "stats", title: "Stats", visible: true, data: {} },
    ],
    tasks: [],
  });

  function toggleWidget(id) {
    const idx = state.widgets.findIndex((w) => w.id === id);
    if (idx !== -1) {
      setState("widgets", idx, "visible", (v) => !v);
    }
  }

  function updateWidgetData(id, data) {
    const idx = state.widgets.findIndex((w) => w.id === id);
    if (idx !== -1) {
      setState("widgets", idx, "data", (prev) => ({ ...prev, ...data }));
    }
  }

  function addTask(title) {
    setState("tasks", (tasks) => [
      ...tasks,
      { id: nextId++, title, done: false },
    ]);
  }

  function removeTask(id) {
    setState("tasks", (tasks) => tasks.filter((t) => t.id !== id));
  }

  return { state, toggleWidget, updateWidgetData, addTask, removeTask };
}
