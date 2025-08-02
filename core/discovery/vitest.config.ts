import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      enabled: false,
      provider: 'v8',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/types.ts',
        '**/example-extension-wallet/**',
        'examples/**',
        'coverage/**',
        'vitest.config.ts',
        'docs/**',
        '**/*.config.ts',
        '**/*.config.js',
      ],
    },
    testTimeout: 10000,
    passWithNoTests: false,
    sequence: {
      concurrent: false,
    },
  },
});
