/**
 * A card that displays a statistic with a label, value, and optional unit.
 */
export function StatsCard(props) {
  return (
    <div class="stats-card">
      <h3>{props.label}</h3>
      <p class="stats-value">
        {props.value}
        {props.unit && <span class="stats-unit">{props.unit}</span>}
      </p>
    </div>
  );
}

/**
 * A badge that shows a health status.
 */
export function HealthBadge(props) {
  return (
    <span class={`badge badge-${props.status}`}>
      {props.status}
    </span>
  );
}
