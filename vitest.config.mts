import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: [
      '__tests__/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
      'tests/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
  },
});
