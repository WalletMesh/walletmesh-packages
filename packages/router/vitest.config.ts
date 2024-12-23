import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: [
        'src/**/*.ts',
        '!src/**/types.ts',
        '!src/**/index.ts',
        '!src/**/*.test.ts',
        '!src/**/test-utils.ts',
      ],
    },
  },
});
