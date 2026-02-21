import { createStore } from "solid-js/store";

/**
 * Create a dashboard store with widgets and tasks.
 * @returns {{
 *   state: { widgets: Array, tasks: Array },
 *   toggleWidget: (id: string) => void,
 *   updateWidgetData: (id: string, data: Object) => void,
 *   addTask: (title: string) => void,
 *   removeTask: (id: number) => void
 * }}
 */
export function createDashboardStore() {
  // TODO: Create a store with initial state:
  //   widgets: [
  //     { id: "weather", title: "Weather", visible: true, data: {} },
  //     { id: "tasks", title: "Tasks", visible: true, data: {} },
  //     { id: "stats", title: "Stats", visible: true, data: {} },
  //   ],
  //   tasks: []

  // TODO: Implement toggleWidget(id) - flip visible for matching widget
  // TODO: Implement updateWidgetData(id, data) - merge data into widget's data
  // TODO: Implement addTask(title) - add { id: nextId++, title, done: false }
  //   (Use a `let nextId = 1` counter above the store)
  // TODO: Implement removeTask(id) - filter out task with matching id

  // TODO: Return { state, toggleWidget, updateWidgetData, addTask, removeTask }
}
