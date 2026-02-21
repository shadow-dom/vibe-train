import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import { createRoot } from "solid-js";
import { createWeatherResource, WeatherDisplay } from "./WeatherWidget.jsx";

afterEach(cleanup);

describe("createWeatherResource", () => {
  it("resolves data from fetch function", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ temp: 72, condition: "Sunny" });

    let weather, loading;

    createRoot((dispose) => {
      const resource = createWeatherResource(mockFetch);
      weather = resource.weather;
      loading = resource.loading;
      // don't dispose yet — need to await
      setTimeout(dispose, 500);
    });

    await waitFor(() => {
      expect(weather()).toEqual({ temp: 72, condition: "Sunny" });
    });
  });

  it("exposes loading state", () => {
    const mockFetch = () => new Promise(() => {}); // never resolves

    createRoot((dispose) => {
      const resource = createWeatherResource(mockFetch);
      expect(resource.loading()).toBe(true);
      dispose();
    });
  });

  it("exposes error state", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    let error;

    createRoot((dispose) => {
      const resource = createWeatherResource(mockFetch);
      error = resource.error;
      setTimeout(dispose, 500);
    });

    await waitFor(() => {
      expect(error()).toBeTruthy();
    });
  });
});

describe("WeatherDisplay", () => {
  it("shows loading message when loading", () => {
    render(() => (
      <WeatherDisplay
        weather={() => undefined}
        loading={() => true}
        error={() => undefined}
      />
    ));
    expect(screen.getByText("Loading weather...")).toBeInTheDocument();
  });

  it("shows error message when there is an error", () => {
    render(() => (
      <WeatherDisplay
        weather={() => undefined}
        loading={() => false}
        error={() => new Error("fail")}
      />
    ));
    expect(screen.getByText("Failed to load weather")).toBeInTheDocument();
  });

  it("shows weather data when loaded", () => {
    render(() => (
      <WeatherDisplay
        weather={() => ({ temp: 72, condition: "Sunny" })}
        loading={() => false}
        error={() => undefined}
      />
    ));
    expect(screen.getByText(/72°/)).toBeInTheDocument();
    expect(screen.getByText("Sunny")).toBeInTheDocument();
  });
});
