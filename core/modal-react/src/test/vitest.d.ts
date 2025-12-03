/// <reference types="vitest/globals" />

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveTextContent(text: string | RegExp): R;
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}

  // Re-export vitest globals as module exports for TypeScript
  export const describe: typeof globalThis.describe;
  export const it: typeof globalThis.it;
  export const test: typeof globalThis.test;
  export const expect: typeof globalThis.expect;
  export const vi: typeof globalThis.vi;
  export const beforeEach: typeof globalThis.beforeEach;
  export const afterEach: typeof globalThis.afterEach;
  export const beforeAll: typeof globalThis.beforeAll;
  export const afterAll: typeof globalThis.afterAll;

  // Re-export Mock type from @vitest/spy
  export type { Mock, MockInstance } from '@vitest/spy';
}
