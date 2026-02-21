import { createSignal } from "solid-js";

/**
 * Create a counter with increment, decrement, and reset.
 * @param {number} initial - Starting count value (default 0)
 * @returns {{ count: () => number, increment: () => void, decrement: () => void, reset: () => void }}
 */
export function createCounter(initial = 0) {
  const [count, setCount] = createSignal(initial);

  return {
    count,
    increment: () => setCount((prev) => prev + 1),
    decrement: () => setCount((prev) => prev - 1),
    reset: () => setCount(initial),
  };
}

/**
 * Create a temperature converter (Fahrenheit ↔ Celsius).
 * @param {number} initialFahrenheit - Starting temperature in Fahrenheit (default 32)
 * @returns {{ fahrenheit: () => number, setFahrenheit: (v: number) => void, celsius: () => number }}
 */
export function createTemperature(initialFahrenheit = 32) {
  const [fahrenheit, setFahrenheit] = createSignal(initialFahrenheit);

  return {
    fahrenheit,
    setFahrenheit,
    celsius: () => ((fahrenheit() - 32) * 5) / 9,
  };
}
