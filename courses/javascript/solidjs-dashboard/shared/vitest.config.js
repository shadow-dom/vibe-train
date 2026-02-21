import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom/vitest"],
  },
  resolve: {
    conditions: ["development", "browser"],
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
