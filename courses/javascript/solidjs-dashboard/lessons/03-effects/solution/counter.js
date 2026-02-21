import { createSignal } from "solid-js";

export function createCounter(initial = 0) {
  const [count, setCount] = createSignal(initial);

  return {
    count,
    increment: () => setCount((prev) => prev + 1),
    decrement: () => setCount((prev) => prev - 1),
    reset: () => setCount(initial),
  };
}

export function createTemperature(initialFahrenheit = 32) {
  const [fahrenheit, setFahrenheit] = createSignal(initialFahrenheit);

  return {
    fahrenheit,
    setFahrenheit,
    celsius: () => ((fahrenheit() - 32) * 5) / 9,
  };
}
