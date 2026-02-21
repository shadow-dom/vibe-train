import { createResource, Show } from "solid-js";

/**
 * Create a weather resource from an async fetch function.
 * @param {() => Promise<{temp: number, condition: string}>} fetchFn
 * @returns {{ weather: () => any, loading: () => boolean, error: () => any, refetch: () => void }}
 */
export function createWeatherResource(fetchFn) {
  // TODO: Use createResource with fetchFn
  // TODO: Return { weather, loading, error, refetch }
}

/**
 * Display weather data with loading and error states.
 * @param {Object} props
 * @param {() => {temp: number, condition: string}} props.weather
 * @param {() => boolean} props.loading
 * @param {() => any} props.error
 */
export function WeatherDisplay(props) {
  // TODO: When loading, show <p class="loading">Loading weather...</p>
  // TODO: When error, show <p class="error">Failed to load weather</p>
  // TODO: Otherwise, show <div class="weather-data"> with:
  //   - <span class="temp">{props.weather().temp}°</span>
  //   - <span class="condition">{props.weather().condition}</span>
}
