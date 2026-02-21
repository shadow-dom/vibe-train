import { createSignal } from "solid-js";

/**
 * Create a counter with increment, decrement, and reset.
 * @param {number} initial - Starting count value (default 0)
 * @returns {{ count: () => number, increment: () => void, decrement: () => void, reset: () => void }}
 */
export function createCounter(initial = 0) {
  // TODO: Create a signal with the initial value
  // TODO: Return { count, increment, decrement, reset }
}

/**
 * Create a temperature converter (Fahrenheit ↔ Celsius).
 * @param {number} initialFahrenheit - Starting temperature in Fahrenheit (default 32)
 * @returns {{ fahrenheit: () => number, setFahrenheit: (v: number) => void, celsius: () => number }}
 */
export function createTemperature(initialFahrenheit = 32) {
  // TODO: Create a signal for Fahrenheit
  // TODO: Return { fahrenheit, setFahrenheit, celsius }
  // celsius should be a function that computes (F - 32) * 5/9
}
