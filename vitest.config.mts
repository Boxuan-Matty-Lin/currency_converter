import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    passWithNoTests: true,
    environment: "happy-dom",
    globals: true,
    include: [
      "**/__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "src/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "tests/**/*.{test,spec}.{ts,tsx,js,jsx}",
    ],
  },
  plugins: [tsconfigPaths()],
});
