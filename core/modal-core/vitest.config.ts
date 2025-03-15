import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/test/', 'dist/', 'vitest.config.ts', 'src/*/index.ts', 'src/index.ts'],
    },
    testTimeout: 10000, // Increase default timeout to 10 seconds
  },
});
