import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './core/*/vitest.config.ts',
  './aztec/*/vitest.config.ts',
  {
    extends: './vitest.config.ts',
  },
]);
