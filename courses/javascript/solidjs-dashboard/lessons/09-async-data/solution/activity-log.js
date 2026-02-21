import { createSignal, createEffect, onCleanup, on } from "solid-js";

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

export function createAutoRefresh(callback, intervalMs) {
  callback();
  const id = setInterval(callback, intervalMs);
  onCleanup(() => clearInterval(id));
}
