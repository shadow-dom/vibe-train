import { describe, it, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createDashboardStats } from "./dashboard-stats.js";

describe("createDashboardStats", () => {
  it("computes stats for [10, 20, 30]", () => {
    createRoot((dispose) => {
      const [data] = createSignal([10, 20, 30]);
      const stats = createDashboardStats(data);

      expect(stats.total()).toBe(60);
      expect(stats.average()).toBe(20);
      expect(stats.min()).toBe(10);
      expect(stats.max()).toBe(30);
      expect(stats.count()).toBe(3);
      dispose();
    });
  });

  it("returns zeros for an empty array", () => {
    createRoot((dispose) => {
      const [data] = createSignal([]);
      const stats = createDashboardStats(data);

      expect(stats.total()).toBe(0);
      expect(stats.average()).toBe(0);
      expect(stats.min()).toBe(0);
      expect(stats.max()).toBe(0);
      expect(stats.count()).toBe(0);
      dispose();
    });
  });

  it("handles a single value", () => {
    createRoot((dispose) => {
      const [data] = createSignal([42]);
      const stats = createDashboardStats(data);

      expect(stats.total()).toBe(42);
      expect(stats.average()).toBe(42);
      expect(stats.min()).toBe(42);
      expect(stats.max()).toBe(42);
      expect(stats.count()).toBe(1);
      dispose();
    });
  });

  it("reactively updates when data changes", () => {
    createRoot((dispose) => {
      const [data, setData] = createSignal([1, 2, 3]);
      const stats = createDashboardStats(data);

      expect(stats.total()).toBe(6);
      expect(stats.average()).toBe(2);

      setData([10, 20]);
      expect(stats.total()).toBe(30);
      expect(stats.average()).toBe(15);
      expect(stats.count()).toBe(2);
      dispose();
    });
  });
});
