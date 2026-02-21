/**
 * A card that displays a statistic with a label, value, and optional unit.
 * @param {Object} props
 * @param {string} props.label - The stat label (e.g. "Total Revenue")
 * @param {string|number} props.value - The stat value
 * @param {string} [props.unit] - Optional unit (e.g. "$", "%")
 */
export function StatsCard(props) {
  // TODO: Return a <div class="stats-card"> containing:
  //   - <h3> with props.label
  //   - <p class="stats-value"> with props.value
  //   - If props.unit exists, <span class="stats-unit"> with props.unit
}

/**
 * A badge that shows a health status.
 * @param {Object} props
 * @param {string} props.status - The status (e.g. "good", "warning", "critical")
 */
export function HealthBadge(props) {
  // TODO: Return a <span> with class="badge badge-{status}"
  //   - Text content should be props.status
}
