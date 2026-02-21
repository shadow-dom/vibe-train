import { createSignal, createEffect, onCleanup, on } from "solid-js";

/**
 * Create an activity log that tracks signal changes.
 * @returns {{ log: () => string[], track: (signal: () => any, label: string) => void, clear: () => void }}
 */
export function createActivityLog() {
  const [log, setLog] = createSignal([]);

  function track(signal, label) {
    createEffect(
      on(signal, (value) => {
        setLog((prev) => [...prev, `${label}: ${value}`]);
      }, { defer: true })
    );
  }

  function clear() {
    setLog([]);
  }

  return { log, track, clear };
}

/**
 * Create an auto-refresh utility that calls a callback at regular intervals.
 * @param {() => void} callback - Function to call on each refresh
 * @param {number} intervalMs - Interval in milliseconds
 */
export function createAutoRefresh(callback, intervalMs) {
  callback();
  const id = setInterval(callback, intervalMs);
  onCleanup(() => clearInterval(id));
}
