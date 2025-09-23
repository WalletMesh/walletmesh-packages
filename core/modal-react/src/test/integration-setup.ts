/**
 * Setup file for integration tests
 * Provides mocks and utilities for testing with real modal-core instances
 */

import { ChainType } from '@walletmesh/modal-core';
import { vi } from 'vitest';

// Mock window.open for popup transport
global.window = Object.assign(global.window || {}, {
  open: vi.fn(() => ({
    closed: false,
    close: vi.fn(),
    focus: vi.fn(),
    postMessage: vi.fn(),
  })),
});

// Mock crypto for wallet operations
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  } as Crypto;
}

// Mock matchMedia for responsive design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Export test utilities
export const testChains = {
  ethereum: { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum' },
  polygon: { chainId: '137', chainType: ChainType.Evm, name: 'Polygon' },
  solana: { chainId: 'mainnet-beta', chainType: ChainType.Solana, name: 'Solana' },
};

export const mockWalletConfig = {
  appName: 'Test App',
  chains: [ChainType.Evm, ChainType.Solana],
  wallets: ['mock'],
  debug: false,
};

// Helper to wait for async updates
export const waitForNextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));
