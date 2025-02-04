import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 500, // .5 second timeout
    coverage: {
      include: ['src/**/*.ts', '!src/**/types.ts', '!src/**/index.ts', '!src/**/*.test.ts'],
    },
  },
});
