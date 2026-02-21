import { mergeProps, splitProps } from "solid-js";

/**
 * A card with a title and children content.
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {any} props.children - Card content
 */
export function DashboardCard(props) {
  // TODO: Render a <div class="dashboard-card"> with:
  //   - <h2> containing props.title
  //   - props.children below
}

/**
 * A responsive grid layout for dashboard cards.
 * @param {Object} props
 * @param {number} [props.columns=3] - Number of grid columns (default: 3)
 * @param {any} props.children - Grid items
 */
export function DashboardGrid(props) {
  // TODO: Use mergeProps to default columns to 3
  // TODO: Render a <div class="dashboard-grid"> with:
  //   - style={{ "grid-template-columns": `repeat(${merged.columns}, 1fr)` }}
  //   - props.children inside
}

/**
 * A label with an icon prefix.
 * @param {Object} props
 * @param {string} props.icon - Icon text/emoji
 * @param {string} props.label - Label text
 * @param {Object} [props....others] - Additional attributes forwarded to the span
 */
export function IconLabel(props) {
  // TODO: Use splitProps to separate ["icon", "label"] from other props
  // TODO: Render a <span class="icon-label" {...others}>
  //   - Content: local.icon followed by a space and local.label
}
