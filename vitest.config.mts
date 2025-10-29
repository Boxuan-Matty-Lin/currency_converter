// vitest.config.mts
import { defineConfig , configDefaults, } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    coverage: {
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "coverage",
    },

    setupFiles: ["setup.env.ts"],

    projects: [
      // Unit tests
      {

        extends: true,
        test: {
          name: "unit",
          include: ["**/*.{test,spec}.{ts,tsx,js,jsx}"],
          exclude: [...configDefaults.exclude,"**/*.integration.test.*"],
          environment: "happy-dom",

        },
      },
      // Integration tests
      {
        extends: true,
        test: {
          name: "integration",
          include: ["**/*.integration.test.ts"],
          environment: "node",
          testTimeout: 30_000,
          setupFiles: ["setup.env.ts"], // Load env vars for integration tests
        },
      },
    ],
  },
});
