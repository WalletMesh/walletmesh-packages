// Test utilities setup file
// This file is loaded by vitest before tests run

import { afterEach, beforeEach, vi } from 'vitest';

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

// Ensure timers and DOM are cleaned between tests
afterEach(() => {
  try {
    // Run and clear any pending timers to prevent leaks in environment teardown
    if (vi.isFakeTimers()) {
      vi.runAllTimers();
      vi.clearAllTimers();
    }
  } catch {
    // ignore
  }
});

// Note: Avoid performing global DOM teardown here.
// happy-dom handles cleanup when the environment is destroyed.
// Manually clearing head/body during afterAll can corrupt internal state
// and cause teardown crashes. Leave final cleanup to the environment.

// Additional test setup can go here if needed
