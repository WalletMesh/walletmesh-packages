/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    environment: 'happy-dom',
    setupFiles: ['src/__tests__/setup.tsx'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/vitest.config.*',
        '**/{babel,jest,rollup,webpack,vite,vitest,postcss}.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@/': '/src/',
    },
  },
});
