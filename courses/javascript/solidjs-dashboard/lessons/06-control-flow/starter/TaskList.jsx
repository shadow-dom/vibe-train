import { For, Show, Switch, Match } from "solid-js";

/**
 * A task list that renders tasks with For and Show.
 * @param {Object} props
 * @param {() => Array<{id: number, title: string, done: boolean}>} props.tasks - Signal getter for tasks array
 */
export function TaskList(props) {
  // TODO: Use <Show> to display a fallback when tasks is empty
  //   - fallback: <p class="empty-message">No tasks yet</p>
  // TODO: Use <For> to render each task as an <li class="task-item">
  //   - Add class "task-done" when task.done is true
  //   - Display the task title as text content
}

/**
 * An icon that changes based on status.
 * @param {Object} props
 * @param {string} props.status - "success", "warning", or "error"
 */
export function StatusIcon(props) {
  // TODO: Use <Switch> and <Match> to render:
  //   - "success" → <span class="icon-success">✓</span>
  //   - "warning" → <span class="icon-warning">⚠</span>
  //   - "error"   → <span class="icon-error">✗</span>
}
