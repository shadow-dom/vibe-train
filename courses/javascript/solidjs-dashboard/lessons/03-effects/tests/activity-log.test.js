import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createActivityLog, createAutoRefresh } from "./activity-log.js";

describe("createActivityLog", () => {
  it("starts with an empty log", () => {
    createRoot((dispose) => {
      const { log } = createActivityLog();
      expect(log()).toEqual([]);
      dispose();
    });
  });

  it("tracks signal changes", () => {
    const [value, setValue] = createSignal(0);
    let log;

    const dispose = createRoot((d) => {
      const result = createActivityLog();
      result.track(value, "count");
      log = result.log;
      return d;
    });

    // Update outside createRoot so effects run synchronously
    setValue(1);
    expect(log()).toEqual(["count: 1"]);

    setValue(2);
    expect(log()).toEqual(["count: 1", "count: 2"]);
    dispose();
  });

  it("tracks multiple signals", () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal("hello");
    let log;

    const dispose = createRoot((d) => {
      const result = createActivityLog();
      result.track(a, "a");
      result.track(b, "b");
      log = result.log;
      return d;
    });

    setA(1);
    setB("world");
    expect(log()).toEqual(["a: 1", "b: world"]);
    dispose();
  });

  it("clears the log", () => {
    const [value, setValue] = createSignal(0);
    let log, clear;

    const dispose = createRoot((d) => {
      const result = createActivityLog();
      result.track(value, "x");
      log = result.log;
      clear = result.clear;
      return d;
    });

    setValue(1);
    expect(log()).toEqual(["x: 1"]);

    clear();
    expect(log()).toEqual([]);
    dispose();
  });
});

describe("createAutoRefresh", () => {
  it("calls the callback immediately", () => {
    createRoot((dispose) => {
      const fn = vi.fn();
      createAutoRefresh(fn, 1000);
      expect(fn).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  it("calls the callback at intervals", () => {
    vi.useFakeTimers();
    createRoot((dispose) => {
      const fn = vi.fn();
      createAutoRefresh(fn, 100);

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(3);
      dispose();
    });
    vi.useRealTimers();
  });

  it("cleans up the interval on dispose", () => {
    vi.useFakeTimers();
    createRoot((dispose) => {
      const fn = vi.fn();
      createAutoRefresh(fn, 100);

      expect(fn).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);

      dispose();

      vi.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledTimes(2);
    });
    vi.useRealTimers();
  });
});
