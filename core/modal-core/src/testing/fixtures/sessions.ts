import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { ConnectionStatus } from '../../api/types/connectionStatus.js';
import type { AccountInfo, SessionLifecycle, SessionState } from '../../api/types/sessionState.js';
import { ChainType } from '../../types.js';
import { getTestAddress, testWallets } from './wallets.js';

/**
 * Create a minimal SessionState for testing
 */
function createMinimalSession(overrides: Partial<SessionState> = {}): SessionState {
  const now = Date.now();
  const address = getTestAddress(ChainType.Evm, 0);

  const defaultAccount: AccountInfo = {
    address,
    index: 0,
    derivationPath: `m/44'/60'/0'/0/0`,
    isDefault: true,
    isActive: true,
  };

  const defaultLifecycle: SessionLifecycle = {
    createdAt: now,
    lastActiveAt: now,
    lastAccessedAt: now,
    operationCount: 0,
    activeTime: 0,
  };

  return {
    sessionId: 'session-test',
    walletId: 'evm-wallet',
    status: ConnectionStatus.Connected,
    accounts: [defaultAccount],
    activeAccount: defaultAccount,
    chain: {
      chainId: '0x1',
      chainType: ChainType.Evm,
      name: 'Ethereum Mainnet',
      required: false,
    },
    provider: {
      instance: {
        connected: true,
        getAccounts: () => Promise.resolve([address]),
        getChainId: () => Promise.resolve('0x1'),
        disconnect: () => Promise.resolve(),
        on: () => {},
        off: () => {},
        removeAllListeners: () => {},
        request: ({ method }: { method: string; params?: unknown[] | Record<string, unknown> }) => {
          // Default responses for common EVM methods
          switch (method) {
            case 'eth_accounts':
              return Promise.resolve([address]);
            case 'eth_chainId':
              return Promise.resolve('0x1');
            case 'eth_requestAccounts':
              return Promise.resolve([address]);
            case 'eth_getBalance':
              return Promise.resolve('0xde0b6b3a7640000'); // 1 ETH
            default:
              return Promise.resolve(null);
          }
        },
      } as BlockchainProvider,
      type: 'eip1193',
      version: '1.0.0',
      multiChainCapable: false,
      supportedMethods: ['eth_accounts', 'eth_sendTransaction'],
    },
    permissions: {
      methods: ['eth_accounts', 'eth_sendTransaction'],
      events: ['accountsChanged', 'chainChanged'],
    },
    metadata: {
      wallet: {
        name: 'EVM Wallet',
        icon: testWallets.evmWallet.icon || '',
        version: '11.0.0',
      },
      dapp: {
        name: 'Test DApp',
      },
      connection: {
        initiatedBy: 'user',
        method: 'manual',
      },
    },
    lifecycle: defaultLifecycle,
    ...overrides,
  };
}

/**
 * Test session fixtures
 */
export const testSessions = {
  /**
   * EVM wallet session
   */
  evmWallet: createMinimalSession({
    sessionId: 'session-evm-wallet',
    walletId: 'evm-wallet',
  }),

  /**
   * Solana wallet session
   */
  solanaWallet: createMinimalSession({
    sessionId: 'session-solana-wallet',
    walletId: 'solana-wallet',
    chain: {
      chainId: 'mainnet-beta',
      chainType: ChainType.Solana,
      name: 'Solana Mainnet',
      required: false,
    },
  }),

  /**
   * Aztec wallet session
   */
  aztecSandbox: createMinimalSession({
    sessionId: 'session-aztec-sandbox',
    walletId: 'aztec-wallet',
    chain: {
      chainId: 'sandbox',
      chainType: ChainType.Aztec,
      name: 'Aztec Sandbox',
      required: false,
    },
  }),
};

/**
 * Create a test session with custom properties
 */
export function createTestSession(overrides?: Partial<SessionState>): SessionState {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return createMinimalSession({
    sessionId,
    ...overrides,
  });
}

/**
 * Create multiple test sessions
 */
export function createMultipleSessions(options?: {
  count?: number;
  walletIds?: string[];
  chainTypes?: ChainType[];
}): SessionState[] {
  const count = options?.count || 3;
  const walletIds = options?.walletIds || ['evm-wallet', 'solana-wallet', 'aztec-wallet'];
  const chainTypes = options?.chainTypes || [ChainType.Evm, ChainType.Solana, ChainType.Aztec];

  return Array.from({ length: count }, (_, i) => {
    const walletId = walletIds[i % walletIds.length] || 'evm-wallet';
    const chainType = chainTypes[i % chainTypes.length] || ChainType.Evm;

    return createTestSession({
      sessionId: `session-${i}`,
      walletId,
      chain: {
        chainId:
          chainType === ChainType.Evm
            ? `0x${i + 1}`
            : chainType === ChainType.Solana
              ? 'mainnet-beta'
              : 'sandbox',
        chainType: chainType,
        name: `Test Chain ${i + 1}`,
        required: false,
      },
    });
  });
}

/**
 * Session test scenarios
 */
export const sessionScenarios = {
  /**
   * No active sessions
   */
  noSessions: () => [],

  /**
   * Single active session
   */
  singleSession: (chainType: ChainType = ChainType.Evm) => {
    switch (chainType) {
      case ChainType.Evm:
        return [testSessions.evmWallet];
      case ChainType.Solana:
        return [testSessions.solanaWallet];
      case ChainType.Aztec:
        return [testSessions.aztecSandbox];
      default:
        return [testSessions.evmWallet];
    }
  },

  /**
   * Multiple sessions across different chains
   */
  multiChainSessions: () => [testSessions.evmWallet, testSessions.solanaWallet, testSessions.aztecSandbox],

  /**
   * Multiple sessions with same wallet
   */
  sameWalletMultipleChains: () => [
    createTestSession({
      sessionId: 'session-evm-mainnet',
      walletId: 'evm-wallet',
      chain: {
        chainId: '0x1',
        chainType: ChainType.Evm,
        name: 'Ethereum Mainnet',
        required: false,
      },
    }),
    createTestSession({
      sessionId: 'session-evm-polygon',
      walletId: 'evm-wallet',
      chain: {
        chainId: '0x89',
        chainType: ChainType.Evm,
        name: 'Polygon',
        required: false,
      },
    }),
    createTestSession({
      sessionId: 'session-evm-optimism',
      walletId: 'evm-wallet',
      chain: {
        chainId: '0xa',
        chainType: ChainType.Evm,
        name: 'Optimism',
        required: false,
      },
    }),
  ],

  /**
   * Disconnected session
   */
  disconnectedSession: () => {
    const session = createTestSession({
      status: 'disconnected',
    });
    // Remove activeAccount for disconnected sessions
    const { activeAccount, ...disconnectedSession } = session;
    return [disconnectedSession as SessionState];
  },

  /**
   * Session with multiple accounts
   */
  multiAccountSession: () => [
    createTestSession({
      accounts: [
        {
          address: getTestAddress(ChainType.Evm, 0),
          index: 0,
          derivationPath: `m/44'/60'/0'/0/0`,
          isDefault: true,
          isActive: true,
        },
        {
          address: getTestAddress(ChainType.Evm, 1),
          index: 1,
          derivationPath: `m/44'/60'/0'/0/1`,
          isActive: false,
        },
        {
          address: getTestAddress(ChainType.Evm, 2),
          index: 2,
          derivationPath: `m/44'/60'/0'/0/2`,
          isActive: false,
        },
      ],
    }),
  ],
};
