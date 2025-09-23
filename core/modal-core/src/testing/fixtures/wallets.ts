import { DebugWallet } from '../../internal/wallets/debug/DebugWallet.js';
import { ChainType } from '../../types.js';
import type { AvailableWallet, WalletInfo } from '../../types.js';

/**
 * Test wallet fixtures
 */
export const testWallets = {
  evmWallet: {
    id: 'evm-wallet',
    name: 'EVM Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y2ODUxQiIvPjxwYXRoIGQ9Ik0yMCA5TDEyIDIxTDIwIDI4TDI4IDIxTDIwIDlaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    chains: [ChainType.Evm],
    description: 'EVM-compatible browser extension wallet',
    downloadUrl: 'https://example.com/download',
  } as WalletInfo,

  solanaWallet: {
    id: 'solana-wallet',
    name: 'Solana Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzUxMjRBQSIvPjxwYXRoIGQ9Ik0yMCAxMEMxNCAxMCAxMCAxNCAxMCAyMEMxMCAyNiAxNCAzMCAyMCAzMEMyNiAzMCAzMCAyNiAzMCAyMEMzMCAxNCAyNiAxMCAyMCAxMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    chains: [ChainType.Solana],
    description: 'Solana-compatible wallet',
    downloadUrl: 'https://example.com/solana-wallet',
  } as WalletInfo,

  aztecWallet: {
    id: 'aztec-wallet',
    name: 'Aztec Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwMDAwMCIvPjxwYXRoIGQ9Ik0yMCAxMEwxMCAyMEgyMEwzMCAyMEwyMCAxMFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    chains: [ChainType.Aztec],
    description: 'Aztec privacy-preserving wallet',
  } as WalletInfo,

  walletB: {
    id: 'wallet-b',
    name: 'Wallet B',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwNTJGRiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEwIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==',
    chains: [ChainType.Evm],
    description: 'Alternative EVM wallet',
    downloadUrl: 'https://example.com/wallet-b',
  } as WalletInfo,

  connectorWallet: {
    id: 'connector-wallet',
    name: 'Connector Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzOTlGRiIvPjxwYXRoIGQ9Ik0xMiAxNUMxMiAxNSAxNSAxMiAyMCAxMkMyNSAxMiAyOCAxNSAyOCAxNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
    chains: [ChainType.Evm],
    description: 'Connect via protocol bridge',
    features: ['qr-code'],
  } as WalletInfo,

  multiChainWallet: {
    id: 'multi-chain',
    name: 'Multi-Chain Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk1DPC90ZXh0Pjwvc3ZnPg==',
    chains: [ChainType.Evm, ChainType.Solana, ChainType.Aztec],
    description: 'Wallet supporting multiple chains',
  } as WalletInfo,
};

/**
 * Create an available wallet from a wallet info
 */
export function createAvailableWallet(
  wallet: WalletInfo,
  options?: {
    isInstalled?: boolean;
    isConnected?: boolean;
    provider?: unknown;
  },
): AvailableWallet {
  return {
    ...wallet,
    adapter: new DebugWallet({ chains: wallet.chains }),
    available: options?.isInstalled ?? true,
    customData: {
      isConnected: options?.isConnected ?? false,
      provider: options?.provider ?? {},
    },
  };
}

/**
 * Create a list of test available wallets
 * Only includes commonly installed wallets by default
 */
export function createTestAvailableWallets(): AvailableWallet[] {
  return [
    createAvailableWallet(testWallets.evmWallet, { isInstalled: true }),
    createAvailableWallet(testWallets.solanaWallet, { isInstalled: true }),
    // Note: Wallet B is only included if explicitly needed in specific test scenarios
    // Use walletScenarios.allInstalled() or walletScenarios.mixedInstallation() for comprehensive tests
  ];
}

/**
 * Test wallet addresses by chain type
 */
export const testAddresses = {
  evm: [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321',
    '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  ],
  solana: [
    '11111111111111111111111111111111',
    '22222222222222222222222222222222',
    '33333333333333333333333333333333',
  ],
  aztec: ['0x1234567890123456789012345678901234567890', '0x0987654321098765432109876543210987654321'],
};

/**
 * Get test address for chain type
 */
export function getTestAddress(chainType: ChainType, index = 0): string {
  const addresses = testAddresses[chainType.toLowerCase() as keyof typeof testAddresses];
  return addresses?.[index] || addresses?.[0] || '0x0000000000000000000000000000000000000000';
}

/**
 * Create wallet test scenarios
 */
export const walletScenarios = {
  /**
   * All wallets installed and available
   */
  allInstalled: () => [
    createAvailableWallet(testWallets.evmWallet, { isInstalled: true }),
    createAvailableWallet(testWallets.solanaWallet, { isInstalled: true }),
    createAvailableWallet(testWallets.walletB, { isInstalled: true }),
  ],

  /**
   * No wallets installed
   */
  noneInstalled: () => [
    createAvailableWallet(testWallets.evmWallet, { isInstalled: false }),
    createAvailableWallet(testWallets.solanaWallet, { isInstalled: false }),
    createAvailableWallet(testWallets.walletB, { isInstalled: false }),
  ],

  /**
   * Mixed installation status
   */
  mixedInstallation: () => [
    createAvailableWallet(testWallets.evmWallet, { isInstalled: true }),
    createAvailableWallet(testWallets.solanaWallet, { isInstalled: false }),
    createAvailableWallet(testWallets.walletB, { isInstalled: true }),
  ],

  /**
   * Single chain type only
   */
  singleChainType: (chainType: ChainType) =>
    Object.values(testWallets)
      .filter((w) => w.chains.includes(chainType))
      .map((w) => createAvailableWallet(w, { isInstalled: true })),

  /**
   * Connected wallet scenario
   */
  withConnected: (walletId: string) =>
    Object.values(testWallets).map((w) =>
      createAvailableWallet(w, {
        isInstalled: true,
        isConnected: w.id === walletId,
      }),
    ),
};
