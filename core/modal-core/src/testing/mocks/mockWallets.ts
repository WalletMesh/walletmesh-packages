import { vi } from 'vitest';
import { ChainType } from '../../types.js';
import type { WalletInfo } from '../../types.js';

/**
 * Pre-configured mock wallets
 */
export const mockWallets = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y2ODUxQiIvPjxwYXRoIGQ9Ik0yMCA5TDEyIDIxTDIwIDI4TDI4IDIxTDIwIDlaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    chains: [ChainType.Evm],
    description: 'MetaMask browser extension wallet',
  } as WalletInfo,

  phantom: {
    id: 'phantom',
    name: 'Phantom',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzUxMjRBQSIvPjxwYXRoIGQ9Ik0yMCAxMEMxNCAxMCAxMCAxNCAxMCAyMEMxMCAyNiAxNCAzMCAyMCAzMEMyNiAzMCAzMCAyNiAzMCAyMEMzMCAxNCAyNiAxMCAyMCAxMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    chains: [ChainType.Solana],
    description: 'Phantom wallet for Solana',
  } as WalletInfo,

  aztecWallet: {
    id: 'aztec-wallet',
    name: 'Aztec Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik0yMCAxMEwxMCAyMEgyMEwzMCAyMEwyMCAxMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    chains: [ChainType.Aztec],
    description: 'Aztec privacy-preserving wallet',
  } as WalletInfo,

  mock: {
    id: 'mock',
    name: 'Mock Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD9IgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk08L3RleHQ+PC9zdmc+',
    chains: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
    description: 'Mock wallet for testing - supports all chains',
  } as WalletInfo,

  coinbase: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNTJGRiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    chains: [ChainType.Evm],
    description: 'Coinbase Wallet',
  } as WalletInfo,

  walletConnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzOTlGRiIvPjxwYXRoIGQ9Ik0xMiAxNUMxMiAxNSAxNSAxMiAyMCAxMkMyNSAxMiAyOCAxNSAyOCAxNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
    chains: [ChainType.Evm],
    description: 'Connect via WalletConnect protocol',
  } as WalletInfo,
};

/**
 * Create a mock wallet discovery service
 */
export function createMockWalletDiscovery() {
  const availableWallets = new Set(['metamask', 'phantom', 'mock']);

  return {
    discoverWallets: vi.fn().mockImplementation(async () => {
      // Simulate discovery delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return Array.from(availableWallets)
        .map((id) => mockWallets[id as keyof typeof mockWallets])
        .filter(Boolean);
    }),

    checkAvailability: vi.fn().mockImplementation(async (walletId: string) => {
      return availableWallets.has(walletId);
    }),

    announceWallet: vi.fn(),

    // Test helpers
    setAvailableWallets: (walletIds: string[]) => {
      availableWallets.clear();
      for (const id of walletIds) {
        availableWallets.add(id);
      }
    },

    addWallet: (walletId: string) => {
      availableWallets.add(walletId);
    },

    removeWallet: (walletId: string) => {
      availableWallets.delete(walletId);
    },
  };
}

/**
 * Create a custom mock wallet
 */
export function createMockWallet(overrides: Partial<WalletInfo> & { id: string }): WalletInfo {
  return {
    name: overrides.id,
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+',
    chains: [ChainType.Evm],
    description: `Mock ${overrides.id} wallet`,
    ...overrides,
  } as WalletInfo;
}

/**
 * Get mock wallets by chain type
 */
export function getMockWalletsByChain(chainType: ChainType): WalletInfo[] {
  return Object.values(mockWallets).filter((wallet) => wallet.chains.includes(chainType));
}

/**
 * Create a mock wallet registry
 */
export function createMockWalletRegistry() {
  const wallets = new Map(Object.entries(mockWallets));

  return {
    register: vi.fn().mockImplementation((wallet: WalletInfo) => {
      wallets.set(wallet.id, wallet);
    }),

    unregister: vi.fn().mockImplementation((walletId: string) => {
      wallets.delete(walletId);
    }),

    get: vi.fn().mockImplementation((walletId: string) => {
      return wallets.get(walletId);
    }),

    getAll: vi.fn().mockImplementation(() => {
      return Array.from(wallets.values());
    }),

    getByChain: vi.fn().mockImplementation((chainType: ChainType) => {
      return Array.from(wallets.values()).filter((w) => w.chains.includes(chainType));
    }),

    has: vi.fn().mockImplementation((walletId: string) => {
      return wallets.has(walletId);
    }),

    clear: vi.fn().mockImplementation(() => {
      wallets.clear();
    }),
  };
}
