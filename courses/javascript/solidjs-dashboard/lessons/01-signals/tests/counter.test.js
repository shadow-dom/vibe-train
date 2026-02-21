import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createCounter, createTemperature } from "./counter.js";

describe("createCounter", () => {
  it("starts at 0 by default", () => {
    createRoot((dispose) => {
      const { count } = createCounter();
      expect(count()).toBe(0);
      dispose();
    });
  });

  it("starts at a custom initial value", () => {
    createRoot((dispose) => {
      const { count } = createCounter(10);
      expect(count()).toBe(10);
      dispose();
    });
  });

  it("increments the count", () => {
    createRoot((dispose) => {
      const { count, increment } = createCounter(0);
      increment();
      expect(count()).toBe(1);
      increment();
      expect(count()).toBe(2);
      dispose();
    });
  });

  it("decrements the count", () => {
    createRoot((dispose) => {
      const { count, decrement } = createCounter(5);
      decrement();
      expect(count()).toBe(4);
      decrement();
      expect(count()).toBe(3);
      dispose();
    });
  });

  it("resets to the initial value", () => {
    createRoot((dispose) => {
      const { count, increment, reset } = createCounter(3);
      increment();
      increment();
      expect(count()).toBe(5);
      reset();
      expect(count()).toBe(3);
      dispose();
    });
  });
});

describe("createTemperature", () => {
  it("starts at 32°F (0°C) by default", () => {
    createRoot((dispose) => {
      const { fahrenheit, celsius } = createTemperature();
      expect(fahrenheit()).toBe(32);
      expect(celsius()).toBeCloseTo(0);
      dispose();
    });
  });

  it("starts at a custom Fahrenheit value", () => {
    createRoot((dispose) => {
      const { fahrenheit } = createTemperature(212);
      expect(fahrenheit()).toBe(212);
      dispose();
    });
  });

  it("converts Fahrenheit to Celsius correctly", () => {
    createRoot((dispose) => {
      const { celsius } = createTemperature(212);
      expect(celsius()).toBeCloseTo(100);
      dispose();
    });
  });

  it("updates Celsius when Fahrenheit changes", () => {
    createRoot((dispose) => {
      const { setFahrenheit, celsius } = createTemperature(32);
      expect(celsius()).toBeCloseTo(0);
      setFahrenheit(72);
      expect(celsius()).toBeCloseTo(22.222, 2);
      dispose();
    });
  });
});
