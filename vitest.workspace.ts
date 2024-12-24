import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './packages/*/vitest.config.ts',
  {
    extends: './vitest.config.ts',
  },
]);
