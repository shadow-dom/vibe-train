import { For, Show, Switch, Match } from "solid-js";

/**
 * A task list that renders tasks with For and Show.
 */
export function TaskList(props) {
  return (
    <Show
      when={props.tasks().length > 0}
      fallback={<p class="empty-message">No tasks yet</p>}
    >
      <ul>
        <For each={props.tasks()}>
          {(task) => (
            <li class={`task-item${task.done ? " task-done" : ""}`}>
              {task.title}
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}

/**
 * An icon that changes based on status.
 */
export function StatusIcon(props) {
  return (
    <Switch>
      <Match when={props.status === "success"}>
        <span class="icon-success">✓</span>
      </Match>
      <Match when={props.status === "warning"}>
        <span class="icon-warning">⚠</span>
      </Match>
      <Match when={props.status === "error"}>
        <span class="icon-error">✗</span>
      </Match>
    </Switch>
  );
}
