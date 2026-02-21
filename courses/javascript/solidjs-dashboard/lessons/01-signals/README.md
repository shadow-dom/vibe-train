# Lesson 1: Reactive Signals

## Objectives

- Understand Solid.js reactive signals with `createSignal`
- Build a counter with increment, decrement, and reset
- Create a temperature converter with derived reactive state

## Concepts

Solid.js reactivity starts with **signals** — reactive values that automatically notify subscribers when they change.

### Creating a signal

```js
import { createSignal } from "solid-js";

const [count, setCount] = createSignal(0);
count();       // read: 0
setCount(5);   // write
count();       // read: 5
```

`createSignal` returns a **getter** (a function you call to read the value) and a **setter**.

### Updating based on previous value

```js
setCount(prev => prev + 1);
```

### Reactive patterns

Signals are the foundation of everything in Solid.js. Unlike React, components don't re-run — only the specific expressions that read signals update when values change.

## Instructions

1. Open `counter.js`
2. Implement `createCounter(initial)` that returns `{ count, increment, decrement, reset }`
   - `count` — a signal getter returning the current count
   - `increment` — increases count by 1
   - `decrement` — decreases count by 1
   - `reset` — sets count back to the initial value
3. Implement `createTemperature(initialFahrenheit)` that returns `{ fahrenheit, setFahrenheit, celsius }`
   - `fahrenheit` — a signal getter for the Fahrenheit value
   - `setFahrenheit` — setter for the Fahrenheit value
   - `celsius` — a **function** that returns the converted Celsius value: `(F - 32) * 5/9`

## Validate Your Work

```bash
make test-lesson N=1
```

## Hints

<details>
<summary>Hint 1: Counter structure</summary>

```js
const [count, setCount] = createSignal(initial);
return {
  count,
  increment: () => setCount(prev => prev + 1),
  // ...
};
```

</details>

<details>
<summary>Hint 2: Temperature conversion</summary>

`celsius` should be a function that computes the conversion each time it's called:

```js
celsius: () => (fahrenheit() - 32) * 5 / 9
```

</details>

## Key Takeaways

- `createSignal` returns a getter function and a setter function
- Read a signal by calling it: `count()`, not `count`
- The setter can take a value or a function of the previous value
- Signals are the smallest unit of reactivity in Solid.js

## Next

Continue to [Lesson 2: Derived State & Memos](../02-derived-state/).
