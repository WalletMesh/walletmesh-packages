import react from '@vitejs/plugin-react';
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mock heavy blockchain libraries to reduce memory usage in tests
      '@aztec/aztec.js': new URL('./src/test/mocks/aztec.js', import.meta.url).pathname,
      '@solana/web3.js': new URL('./src/test/mocks/solana.js', import.meta.url).pathname,
      // Mock optional peer dependencies
      ethers: new URL('./src/test/mocks/ethers.js', import.meta.url).pathname,
      web3: new URL('./src/test/mocks/web3.js', import.meta.url).pathname,
      viem: new URL('./src/test/mocks/viem.js', import.meta.url).pathname,
      // Mock CSS module imports in tests
      '\\.module\\.css$': new URL('./src/test/mocks/cssModule.js', import.meta.url).pathname,
      '\\.css$': new URL('./src/test/mocks/css.js', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Skip memory-intensive tests that use runtime imports
      // These tests load entire module bundles just to verify exports
      '**/exports/**',
      '**/isolation/**',
      '**/integration/**',
    ],
    testTimeout: 5000,
    hookTimeout: 5000,
    teardownTimeout: 2000,
    // Limit test concurrency to reduce memory pressure
    maxConcurrency: 1,
    fileParallelism: false,
    // No special env needed; jsdom handles teardown cleanly
    // Disable isolation to reduce memory pressure
    isolate: false,
    // Pool options to better handle async operations
    // Use threads with singleThread to reduce memory pressure
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    // Reduce noise from expected errors in tests
    dangerouslyIgnoreUnhandledErrors: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    deps: {
      optimizer: {
        web: {
          include: ['@testing-library/jest-dom'],
        },
      },
    },
  },
});
