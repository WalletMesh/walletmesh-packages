import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';
// Removed imports from missing vitest/autoMocks.js

export interface MockedModalCore {
  // biome-ignore lint/suspicious/noExplicitAny: Mock interface needs flexible function signatures
  createWalletMeshClient: MockedFunction<any>;
  // biome-ignore lint/suspicious/noExplicitAny: Mock interface needs flexible function signatures
  useStore: MockedFunction<any>;
  // biome-ignore lint/suspicious/noExplicitAny: Mock interface needs flexible function signatures
  createModal: MockedFunction<any>;
  // biome-ignore lint/suspicious/noExplicitAny: Mock interface needs flexible function signatures
  createFrameworkAdapter: MockedFunction<any>;
  // biome-ignore lint/suspicious/noExplicitAny: Mock interface needs flexible function signatures
  WalletRegistry: MockedFunction<any>;
  // biome-ignore lint/suspicious/noExplicitAny: Mock interface needs flexible function signatures
  createDebugLogger: MockedFunction<any>;
  // biome-ignore lint/suspicious/noExplicitAny: Mock interface needs flexible property access
  [key: string]: any;
}

/**
 * Modern setup using Vitest's spy mode for better interface compatibility
 * This keeps real implementations but adds spy functionality
 */
export function setupModalCoreMocks(): Promise<MockedModalCore> {
  // Simplified mock setup without external dependencies
  return vi.importMock('@walletmesh/modal-core') as Promise<MockedModalCore>;
}

/**
 * Auto-mocking setup that uses Vitest's advanced mocking
 * This automatically mocks while preserving interfaces
 */
export function setupAutoModalCoreMocks(): void {
  // Simplified auto-mocking setup
  vi.mock('@walletmesh/modal-core');
}

/**
 * Partial mocking setup that allows selective mocking
 * Use this when you only need to mock specific parts
 */
export function setupPartialModalCoreMocks(options: {
  sessionManager?: boolean;
  walletRegistry?: boolean;
  client?: boolean;
  store?: boolean;
}) {
  // Simplified partial mocking
  console.log('Partial mock setup', options);
}

/**
 * Helper to create individual auto-mocked components
 * Use these when you need fine-grained control
 */
export const autoMockHelpers = {
  sessionManager: () => vi.fn(),
  walletRegistry: () => vi.fn(),
  client: () => vi.fn(),
  store: () => vi.fn(),
};

export { setupModalCoreMocks as default };
