# Lesson 10: Assembling the Dashboard

## Objectives

- Compose all previously built components into a full dashboard
- Wire up the store, theme context, and weather resource together
- Verify the complete application works end-to-end

## Concepts

This lesson brings together everything from lessons 1–9:

- **Signals & Memos** (Lessons 1–2) for reactive state
- **Effects** (Lesson 3) for side effects
- **Components** (Lessons 4–5) for UI building blocks
- **Control flow** (Lesson 6) for lists and conditionals
- **Stores** (Lesson 7) for complex state
- **Context** (Lesson 8) for theme toggling
- **Resources** (Lesson 9) for async data

## Instructions

1. Open `App.jsx`
2. Implement a `Dashboard` component that:
   - Wraps everything in `<ThemeProvider>`
   - Uses `createDashboardStore()` for widget and task state
   - Uses `createWeatherResource()` with a mock fetch function
   - Renders a `<ThemeToggle />` button
   - Renders a `<DashboardGrid>` containing:
     - A `<DashboardCard title="Weather">` with `<WeatherDisplay>` inside
     - A `<DashboardCard title="Tasks">` with `<TaskList>` and an "Add Task" button
     - A `<DashboardCard title="Stats">` with a `<StatsCard>`
   - Each card should be conditionally shown based on its widget's `visible` flag
   - The "Add Task" button should call `addTask("New Task")` on click

## Validate Your Work

```bash
make test-lesson N=10
```

## Hints

<details>
<summary>Hint 1: Setting up the store and resource</summary>

```jsx
function Dashboard() {
  const { state, addTask, toggleWidget } = createDashboardStore();
  const { weather, loading, error } = createWeatherResource(mockFetchWeather);
  // ...
}
```

</details>

<details>
<summary>Hint 2: Conditional widget rendering</summary>

```jsx
<Show when={state.widgets.find(w => w.id === "weather")?.visible}>
  <DashboardCard title="Weather">
    <WeatherDisplay weather={weather} loading={loading} error={error} />
  </DashboardCard>
</Show>
```

</details>

## Key Takeaways

- Solid.js composability shines when assembling complex UIs from small primitives
- Each piece — signals, stores, context, resources — serves a specific purpose
- The dashboard demonstrates reactive, efficient UI updates without a virtual DOM

Congratulations — you've built a complete interactive dashboard with Solid.js!
