import { createMemo } from "solid-js";

/**
 * Create derived dashboard statistics from a data signal.
 * @param {() => number[]} dataSignal - A signal getter returning an array of numbers
 * @returns {{ total: () => number, average: () => number, min: () => number, max: () => number, count: () => number }}
 */
export function createDashboardStats(dataSignal) {
  // TODO: Create memos for total, average, min, max, count
  // Remember to handle empty arrays (return 0 instead of NaN/Infinity)
  // TODO: Return { total, average, min, max, count }
}
