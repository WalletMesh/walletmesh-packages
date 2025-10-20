import react from '@vitejs/plugin-react';
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
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
    testTimeout: 5000,
    hookTimeout: 5000,
    teardownTimeout: 1000, // Reduced - fake timers make cleanup instant
    // Minimal isolation with optimized pool for best performance
    isolate: true, // Keep isolation for test reliability
    pool: 'forks', // forks pool is faster than vmForks and more stable
    maxConcurrency: 5, // Limit concurrent tests to reduce memory usage
    poolOptions: {
      forks: {
        singleFork: false, // Use multiple forks for parallelization
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
