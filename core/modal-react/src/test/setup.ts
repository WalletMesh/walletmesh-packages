import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scroll into view
Element.prototype.scrollIntoView = vi.fn();

// Suppress specific console warnings
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('inside a test was not wrapped in act')) {
    return;
  }
  originalError.call(console, ...args);
};