import { createMemo } from "solid-js";

/**
 * Create derived dashboard statistics from a data signal.
 * @param {() => number[]} dataSignal - A signal getter returning an array of numbers
 * @returns {{ total: () => number, average: () => number, min: () => number, max: () => number, count: () => number }}
 */
export function createDashboardStats(dataSignal) {
  const count = createMemo(() => dataSignal().length);

  const total = createMemo(() =>
    dataSignal().reduce((sum, n) => sum + n, 0)
  );

  const average = createMemo(() => {
    const len = count();
    return len === 0 ? 0 : total() / len;
  });

  const min = createMemo(() => {
    const data = dataSignal();
    return data.length === 0 ? 0 : Math.min(...data);
  });

  const max = createMemo(() => {
    const data = dataSignal();
    return data.length === 0 ? 0 : Math.max(...data);
  });

  return { total, average, min, max, count };
}
