import { createResource, Show } from "solid-js";

/**
 * Create a weather resource from an async fetch function.
 */
export function createWeatherResource(fetchFn) {
  const [data, { refetch }] = createResource(fetchFn);

  return {
    weather: () => data(),
    loading: () => data.loading,
    error: () => data.error,
    refetch,
  };
}

/**
 * Display weather data with loading and error states.
 */
export function WeatherDisplay(props) {
  return (
    <Show
      when={!props.loading()}
      fallback={<p class="loading">Loading weather...</p>}
    >
      <Show
        when={!props.error()}
        fallback={<p class="error">Failed to load weather</p>}
      >
        <div class="weather-data">
          <span class="temp">{props.weather().temp}°</span>
          <span class="condition">{props.weather().condition}</span>
        </div>
      </Show>
    </Show>
  );
}
