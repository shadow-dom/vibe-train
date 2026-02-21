import { createSignal, Show } from "solid-js";
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
 */
export function Dashboard() {
  const { state, addTask, toggleWidget } = createDashboardStore();
  const { weather, loading, error } = createWeatherResource(mockFetchWeather);

  const tasks = () => state.tasks;

  return (
    <ThemeProvider>
      <div class="dashboard">
        <ThemeToggle />
        <DashboardGrid>
          <Show when={state.widgets.find((w) => w.id === "weather")?.visible}>
            <DashboardCard title="Weather">
              <WeatherDisplay weather={weather} loading={loading} error={error} />
            </DashboardCard>
          </Show>
          <Show when={state.widgets.find((w) => w.id === "tasks")?.visible}>
            <DashboardCard title="Tasks">
              <TaskList tasks={tasks} />
              <button onClick={() => addTask("New Task")}>Add Task</button>
            </DashboardCard>
          </Show>
          <Show when={state.widgets.find((w) => w.id === "stats")?.visible}>
            <DashboardCard title="Stats">
              <StatsCard label="Total Tasks" value={state.tasks.length} />
            </DashboardCard>
          </Show>
        </DashboardGrid>
      </div>
    </ThemeProvider>
  );
}
