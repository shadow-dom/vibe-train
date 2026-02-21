# Build an Interactive Dashboard with Solid.js

> Learn Solid.js from scratch by building an interactive dashboard. Start with reactive signals, progress through components and stores, and finish with a fully composed dashboard application.

## Prerequisites

- Basic JavaScript (variables, functions, arrays, objects)
- Familiarity with the command line
- Node.js 18+ installed

## Lessons

| # | Lesson | Topic |
|---|--------|-------|
| 1 | [Reactive Signals](lessons/01-signals/) | createSignal basics with a counter and temperature converter |
| 2 | [Derived State & Memos](lessons/02-derived-state/) | createMemo for computed stats (total, average, min, max) |
| 3 | [Effects & Lifecycle](lessons/03-effects/) | createEffect, onCleanup, and auto-refresh patterns |
| 4 | [Your First Component](lessons/04-first-component/) | JSX basics with StatsCard and HealthBadge components |
| 5 | [Props & Composition](lessons/05-props-children/) | mergeProps, splitProps, and children for composable cards |
| 6 | [Lists & Conditional Rendering](lessons/06-control-flow/) | For, Show, Switch/Match for dynamic task lists |
| 7 | [Stores & Complex State](lessons/07-stores/) | createStore for nested dashboard state |
| 8 | [Context & Theme Toggle](lessons/08-context-theme/) | createContext, useContext, and a theme provider |
| 9 | [Async Data & Resources](lessons/09-async-data/) | createResource for loading weather data |
| 10 | [Assembling the Dashboard](lessons/10-full-dashboard/) | Compose everything into a working dashboard |

## Getting Started

1. Ensure you have Node.js 18+ installed:
   ```bash
   node --version
   ```

2. Start with [Lesson 1: Reactive Signals](lessons/01-signals/).

## Validating Your Work

Run tests for a specific lesson:

```bash
make test-lesson N=1
```

Run all lesson tests:

```bash
make test-all
```

Course authors can verify solutions:

```bash
make validate-solution N=1
```
