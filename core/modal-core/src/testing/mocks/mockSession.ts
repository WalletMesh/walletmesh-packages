/**
 * Simplified session mocking - only what's actually used in tests
 */

import type { SessionState } from '../../api/types/sessionState.js';
import { ChainType } from '../../types.js';

/**
 * Create a mock session state with sensible defaults
 * This is the only session mock function actually used in tests
 */
export function createMockSessionState(overrides?: Partial<SessionState>): SessionState {
  const address = overrides?.activeAccount?.address || '0x1234567890123456789012345678901234567890';

  return {
    sessionId: `session-${Date.now()}`,
    walletId: 'mock-wallet',
    status: 'connected',
    chain: {
      chainId: '0x1',
      chainType: ChainType.Evm,
      name: 'Ethereum Mainnet',
      required: false,
    },
    // Simple provider stub - tests can override if needed
    provider: {
      instance: {
        getAccounts: () => Promise.resolve([address]),
        getChainId: () => Promise.resolve('0x1'),
        disconnect: () => Promise.resolve(),
        on: () => {},
        off: () => {},
        removeAllListeners: () => {},
        request: ({ method }: { method: string; params?: unknown[] | Record<string, unknown> }) => {
          // Simple mock responses for common methods
          switch (method) {
            case 'eth_accounts':
              return Promise.resolve([address]);
            case 'eth_chainId':
              return Promise.resolve('0x1');
            default:
              return Promise.resolve(null);
          }
        },
      },
      type: 'eip1193',
      version: '1.0.0',
      multiChainCapable: false,
      supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
    },
    // Minimal required fields
    accounts: [
      {
        address,
        index: 0,
        derivationPath: "m/44'/60'/0'/0/0",
        isActive: true,
      },
    ],
    activeAccount: {
      address,
      index: 0,
      derivationPath: "m/44'/60'/0'/0/0",
    },
    metadata: {
      wallet: { name: 'Mock Wallet', icon: '', version: '1.0.0' },
      dapp: { name: 'Test App' },
      connection: { initiatedBy: 'user', method: 'manual' },
    },
    permissions: {
      methods: ['eth_accounts', 'eth_sendTransaction'],
      events: ['accountsChanged', 'chainChanged'],
    },
    lifecycle: {
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      lastAccessedAt: Date.now(),
      operationCount: 0,
      activeTime: 0,
    },
    ...overrides,
  };
}
