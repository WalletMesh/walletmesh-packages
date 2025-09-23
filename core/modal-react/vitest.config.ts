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
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 5000,
    hookTimeout: 5000,
    teardownTimeout: 2000,
    // Isolate each test file to prevent timer accumulation
    isolate: true,
    // Pool options to better handle async operations
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
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
