# Lesson 9: Async Data & Resources

## Objectives

- Use `createResource` to fetch async data reactively
- Handle loading and error states in components
- Implement refetch for manual data refresh

## Concepts

### createResource

```js
import { createResource } from "solid-js";

const [data, { refetch }] = createResource(fetchFunction);
```

- `data()` — the resolved value (or `undefined` while loading)
- `data.loading` — `true` while the promise is pending
- `data.error` — the error if the promise rejected
- `refetch()` — manually re-triggers the fetch

### Displaying loading/error states

```jsx
<Show when={!data.loading} fallback={<p>Loading...</p>}>
  <Show when={!data.error} fallback={<p>Error: {data.error.message}</p>}>
    <p>{data().name}</p>
  </Show>
</Show>
```

## Instructions

1. Open `WeatherWidget.jsx`
2. Implement `createWeatherResource(fetchFn)`:
   - Uses `createResource` with the provided `fetchFn` as the fetcher
   - Returns `{ weather, loading, error, refetch }`
   - `weather` — a getter for the resolved data
   - `loading` — a getter for the loading state
   - `error` — a getter for the error state
   - `refetch` — a function to re-trigger the fetch
3. Implement `WeatherDisplay(props)`:
   - When `props.loading()` is true, show `<p class="loading">Loading weather...</p>`
   - When `props.error()` is truthy, show `<p class="error">Failed to load weather</p>`
   - Otherwise, show `<div class="weather-data">` with `<span class="temp">{props.weather().temp}°</span>` and `<span class="condition">{props.weather().condition}</span>`

## Validate Your Work

```bash
make test-lesson N=9
```

## Hints

<details>
<summary>Hint 1: createResource setup</summary>

```js
const [data, { refetch }] = createResource(fetchFn);
return {
  weather: () => data(),
  loading: () => data.loading,
  error: () => data.error,
  refetch,
};
```

</details>

<details>
<summary>Hint 2: Nested Show for loading/error</summary>

```jsx
<Show when={!props.loading()} fallback={<p class="loading">Loading weather...</p>}>
  <Show when={!props.error()} fallback={<p class="error">Failed to load weather</p>}>
    ...data display...
  </Show>
</Show>
```

</details>

## Key Takeaways

- `createResource` integrates async data into Solid's reactive system
- Loading and error states are reactive properties on the resource
- `refetch()` lets you manually refresh data without recreating the resource

## Next

Continue to [Lesson 10: Assembling the Dashboard](../10-full-dashboard/).
