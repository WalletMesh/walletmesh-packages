/**
 * Test utilities for WalletMesh Modal Core
 *
 * @internal
 * @module test-utils
 */

import type { ChainType, ConnectionResult, WalletInfo } from '../types.js';
import { ChainType as ChainTypeEnum } from '../types.js';

/**
 * Helper to create a test wallet configuration
 * @internal
 */
export function createTestWallet(options: {
  id: string;
  name?: string;
  chains?: ChainType[];
  icon?: string;
}): WalletInfo {
  return {
    id: options.id,
    name: options.name || `Test Wallet ${options.id}`,
    icon:
      options.icon ||
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgZmlsbD0iIzk5OSIvPjwvc3ZnPg==',
    chains: options.chains || [ChainTypeEnum.Evm],
    description: 'Test wallet for development',
  };
}

/**
 * Get a mock connection result for testing
 * @internal
 */
export function createMockConnectionResult(overrides?: Partial<ConnectionResult>): ConnectionResult {
  return {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f89590',
    accounts: ['0x742d35Cc6634C0532925a3b844Bc9e7595f89590'],
    chain: {
      chainId: '0x1',
      chainType: ChainTypeEnum.Evm,
      name: 'Ethereum Mainnet',
      required: false,
    },
    provider: {},
    walletId: 'debug-wallet',
    walletInfo: createTestWallet({ id: 'debug-wallet' }),
    ...overrides,
  };
}
