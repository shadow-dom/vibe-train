import { mergeProps, splitProps } from "solid-js";

/**
 * A card with a title and children content.
 */
export function DashboardCard(props) {
  return (
    <div class="dashboard-card">
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
}

/**
 * A responsive grid layout for dashboard cards.
 */
export function DashboardGrid(props) {
  const merged = mergeProps({ columns: 3 }, props);
  return (
    <div
      class="dashboard-grid"
      style={{ "grid-template-columns": `repeat(${merged.columns}, 1fr)` }}
    >
      {merged.children}
    </div>
  );
}

/**
 * A label with an icon prefix.
 */
export function IconLabel(props) {
  const [local, others] = splitProps(props, ["icon", "label"]);
  return (
    <span class="icon-label" {...others}>
      {local.icon} {local.label}
    </span>
  );
}
