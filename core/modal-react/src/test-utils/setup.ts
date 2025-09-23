// Test utilities setup file
// This file is loaded by vitest before tests run

import { beforeEach, vi } from 'vitest';

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

// Additional test setup can go here if needed
