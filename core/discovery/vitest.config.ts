import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      enabled: true,
      provider: 'v8',
    },
    testTimeout: 10000,
    passWithNoTests: false,
    sequence: {
      concurrent: false,
    },
  },
});
