import { createSignal, createEffect, onCleanup, on } from "solid-js";

/**
 * Create an activity log that tracks signal changes.
 * @returns {{ log: () => string[], track: (signal: () => any, label: string) => void, clear: () => void }}
 */
export function createActivityLog() {
  // TODO: Create a signal to hold the log entries (array of strings)

  // TODO: Implement track(signal, label) using createEffect + on()
  //   - Use on(signal, callback, { defer: true }) to skip the initial value
  //   - When signal changes, push "<label>: <value>" to the log

  // TODO: Implement clear() to empty the log

  // TODO: Return { log, track, clear }
}

/**
 * Create an auto-refresh utility that calls a callback at regular intervals.
 * @param {() => void} callback - Function to call on each refresh
 * @param {number} intervalMs - Interval in milliseconds
 */
export function createAutoRefresh(callback, intervalMs) {
  // TODO: Call callback immediately
  // TODO: Set up setInterval to call callback every intervalMs
  // TODO: Use onCleanup to clear the interval when disposed
}
