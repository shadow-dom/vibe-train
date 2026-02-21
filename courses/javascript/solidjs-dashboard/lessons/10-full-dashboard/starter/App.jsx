import { Show } from "solid-js";
import { ThemeProvider, ThemeToggle } from "./ThemeContext.jsx";
import { DashboardCard, DashboardGrid } from "./DashboardCard.jsx";
import { StatsCard } from "./StatsCard.jsx";
import { TaskList } from "./TaskList.jsx";
import { WeatherDisplay, createWeatherResource } from "./WeatherWidget.jsx";
import { createDashboardStore } from "./dashboard-store.js";

function mockFetchWeather() {
  return Promise.resolve({ temp: 72, condition: "Sunny" });
}

/**
 * The full dashboard component.
 * Composes ThemeProvider, store, resource, and all UI components.
 */
export function Dashboard() {
  // TODO: Create the dashboard store
  // TODO: Create the weather resource with mockFetchWeather
  // TODO: Create a signal for tasks to pass to TaskList

  // TODO: Return JSX wrapped in <ThemeProvider>:
  //   - <ThemeToggle />
  //   - <DashboardGrid>
  //     - Weather card (shown when weather widget is visible)
  //     - Tasks card with TaskList and "Add Task" button
  //     - Stats card with a StatsCard
  //   </DashboardGrid>
}
