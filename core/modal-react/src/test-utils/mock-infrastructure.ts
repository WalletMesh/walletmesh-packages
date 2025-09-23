/**
 * Comprehensive mock infrastructure for modal-react testing
 *
 * Inspired by jsonrpc's efficient testing patterns, this provides
 * realistic, behavior-driven mocks for testing React components and hooks.
 */

import type {
  AccountInfo,
  BalanceService,
  ChainService,
  ChainSessionInfo,
  ConnectionDisplayData,
  ConnectionService,
  DAppRpcService,
  HeadlessModalState,
  HealthService,
  SessionProvider,
  SessionService,
  SessionState,
  SupportedChain,
  TransactionResult,
  TransactionService,
  UIService,
  WalletConnection,
  WalletDisplayData,
  WalletInfo,
  WalletMeshClient,
  WalletMeshState,
  WalletPreferenceService,
} from '@walletmesh/modal-core';
import { ChainType } from '@walletmesh/modal-core';
import { vi } from 'vitest';

// Define ChainId as string alias for clarity
type ChainId = string;

/**
 * Mock transport similar to jsonrpc's approach
 * Provides controllable message passing for testing
 */
export class MockTransport {
  private messageHandlers: Set<(message: unknown) => void> = new Set();
  private sentMessages: unknown[] = [];

  send = vi.fn(async (message: unknown) => {
    this.sentMessages.push(message);
    return Promise.resolve();
  });

  onMessage = vi.fn((handler: (message: unknown) => void) => {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  });

  // Simulate receiving a message
  simulateMessage(message: unknown) {
    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  // Get all sent messages
  getSentMessages() {
    return this.sentMessages;
  }

  // Clear history
  reset() {
    this.sentMessages = [];
    this.send.mockClear();
    this.onMessage.mockClear();
  }
}

/**
 * Mock wallet scenarios for comprehensive testing
 */
export const WalletScenarios = {
  // Connected wallet with full capabilities
  connectedEvm: {
    sessionId: 'session-evm-connected',
    walletId: 'metamask',
    addresses: ['0x1234567890123456789012345678901234567890', '0xabcdef1234567890123456789012345678901234'],
    chainId: '0x1' as ChainId,
    chainType: ChainType.Evm,
    methods: ['eth_accounts', 'eth_sendTransaction', 'eth_sign', 'personal_sign'],
  },

  // Disconnected state
  disconnected: {
    sessionId: null as string | null,
    walletId: null as string | null,
    addresses: [] as string[],
    chainId: null as ChainId | null,
    chainType: null as ChainType | null,
    methods: [] as string[],
  },

  // Connecting state (intermediate)
  connecting: {
    sessionId: 'session-connecting',
    walletId: 'phantom',
    addresses: [] as string[],
    chainId: null as ChainId | null,
    chainType: ChainType.Solana,
    methods: [] as string[],
  },

  // Multi-chain wallet
  multiChain: {
    sessionId: 'session-multi',
    walletId: 'rainbow',
    addresses: ['0x1111111111111111111111111111111111111111'],
    chainId: '0x89' as ChainId, // Polygon
    chainType: ChainType.Evm,
    methods: ['eth_accounts', 'eth_sendTransaction', 'wallet_switchEthereumChain'],
  },

  // Error state
  errorState: {
    sessionId: 'session-error',
    walletId: 'wallet-error',
    addresses: [] as string[],
    chainId: null as ChainId | null,
    chainType: null as ChainType | null,
    methods: [] as string[],
    error: new Error('Connection failed: User rejected'),
  },
};

/**
 * Mock WalletMeshClient with realistic behavior
 */
export class MockWalletMeshClient implements Partial<WalletMeshClient> {
  private currentScenario: (typeof WalletScenarios)[keyof typeof WalletScenarios] =
    WalletScenarios.disconnected;
  private eventHandlers = new Map<string, Set<(...args: unknown[]) => void>>();
  private stateListeners = new Set<(state: HeadlessModalState) => void>();

  // Core state
  state: WalletMeshState = this.buildState();

  // Methods with realistic behavior - updated to return WalletConnection
  connect = vi.fn(async (walletId?: string, _options?: unknown): Promise<WalletConnection> => {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (walletId === 'error-wallet') {
      throw new Error('Connection failed: Wallet not found');
    }

    if (!walletId) {
      throw new Error('No wallet ID provided');
    }

    // Update to connected scenario
    this.currentScenario = WalletScenarios.connectedEvm;
    this.state = this.buildState();
    this.notifyStateChange();

    const chain: SupportedChain = {
      chainId: this.currentScenario.chainId ?? '0x1',
      name: this.getChainName(this.currentScenario.chainId ?? '0x1'),
      chainType: this.currentScenario.chainType ?? ChainType.Evm,
      required: true,
    };

    return {
      walletId: this.currentScenario.walletId ?? 'unknown',
      address: this.currentScenario.addresses[0] || '',
      accounts: this.currentScenario.addresses,
      chain,
      chainType: this.currentScenario.chainType ?? ChainType.Evm,
      provider: {
        request: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn(),
      } as unknown,
      walletInfo: {
        id: this.currentScenario.walletId ?? '',
        name: this.getWalletName(this.currentScenario.walletId ?? ''),
        icon: `${this.currentScenario.walletId}-icon.png`,
        chains: [this.currentScenario.chainType ?? ChainType.Evm],
      },
      sessionId: this.currentScenario.sessionId ?? 'session-default',
    };
  });

  disconnect = vi.fn(async (): Promise<void> => {
    this.currentScenario = WalletScenarios.disconnected;
    this.state = this.buildState();
    this.notifyStateChange();
  });

  // Updated switchChain to match the expected signature
  switchChain = vi.fn(
    async (
      chain: SupportedChain,
      _walletId?: string,
    ): Promise<{
      provider: unknown;
      chainType: ChainType;
      chain: SupportedChain;
      previousChain: SupportedChain;
    }> => {
      if (!this.currentScenario.sessionId) {
        throw new Error('No active session');
      }

      const previousChain: SupportedChain = {
        chainId: this.currentScenario.chainId ?? '0x1',
        name: this.getChainName(this.currentScenario.chainId ?? '0x1'),
        chainType: this.currentScenario.chainType ?? ChainType.Evm,
        required: true,
      };

      this.currentScenario = { ...this.currentScenario, chainId: chain.chainId };
      this.state = this.buildState();
      this.notifyStateChange();

      return {
        provider: {
          request: vi.fn(),
          on: vi.fn(),
          removeAllListeners: vi.fn(),
        } as unknown,
        chainType: chain.chainType,
        chain,
        previousChain,
      };
    },
  );

  sendTransaction = vi.fn(async (_params: unknown): Promise<TransactionResult> => {
    if (!this.currentScenario.sessionId) {
      throw new Error('No active session');
    }

    // Simulate transaction processing
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      id: `tx-${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      chainId: this.currentScenario.chainId ?? '0x1',
      from: this.currentScenario.addresses[0] || '0x0000000000000000000000000000000000000000',
      status: 'confirmed',
    } as TransactionResult;
  });

  getBalance = vi.fn(async (address?: string): Promise<string> => {
    const addr = address || this.currentScenario.addresses[0];
    if (!addr) {
      throw new Error('No address available');
    }

    // Return mock balance
    return '1000000000000000000'; // 1 ETH in wei
  });

  on = vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  });

  emit = vi.fn((event: string, ...args: unknown[]) => {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(...args);
      }
    }
  });

  // Updated subscribe to use HeadlessModalState
  subscribe = vi.fn((callback: (state: HeadlessModalState) => void) => {
    this.stateListeners.add(callback);
    return () => {
      this.stateListeners.delete(callback);
    };
  });

  // Add getServices method for compatibility with tests
  getServices = vi.fn(() => ({
    connection: {
      connect: vi.fn().mockResolvedValue({ success: true }),
      disconnect: vi.fn().mockResolvedValue({ success: true }),
      reconnect: vi.fn().mockResolvedValue({ success: true }),
      switchAccount: vi.fn().mockResolvedValue({ success: true }),
      getConnectionStatus: vi.fn().mockReturnValue('connected'),
      isConnected: vi.fn().mockReturnValue(true),
      getActiveSession: vi.fn(),
      autoConnect: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as ConnectionService,
    session: {} as unknown as SessionService,
    health: {} as unknown as HealthService,
    ui: {} as unknown as UIService,
    preference: {} as unknown as WalletPreferenceService,
    chain: {} as unknown as ChainService,
    transaction: {} as unknown as TransactionService,
    balance: {} as unknown as BalanceService,
    dappRpc: {} as unknown as DAppRpcService,
  }));

  // Add getState method - returns HeadlessModalState for compatibility
  getState = vi.fn(() => this.toHeadlessState());

  // Add modal property
  modal = {
    open: vi.fn(),
    close: vi.fn(),
    getState: vi.fn(() => this.toHeadlessState()),
    subscribe: this.subscribe,
    getActions: vi.fn(),
    destroy: vi.fn(),
  };

  // Helper methods for testing
  setScenario(scenario: (typeof WalletScenarios)[keyof typeof WalletScenarios]) {
    this.currentScenario = scenario;
    this.state = this.buildState();
    this.notifyStateChange();
  }

  // Update state and notify listeners
  updateState(updater: (state: WalletMeshState) => void) {
    updater(this.state);
    this.notifyStateChange();
  }

  simulateError(error: Error) {
    this.emit('error', error);
  }

  simulateAccountChange(addresses: string[]) {
    this.currentScenario = { ...this.currentScenario, addresses };
    this.state = this.buildState();
    this.notifyStateChange();
    this.emit('accountsChanged', addresses);
  }

  simulateChainChange(chainId: ChainId) {
    this.currentScenario = { ...this.currentScenario, chainId };
    this.state = this.buildState();
    this.notifyStateChange();
    this.emit('chainChanged', chainId);
  }

  // Convert WalletMeshState to HeadlessModalState for subscriptions
  private toHeadlessState(): HeadlessModalState {
    const activeSessionId = this.state.active.sessionId;
    const activeSession = activeSessionId ? this.state.entities.sessions[activeSessionId] : null;
    const isConnected = !!activeSession;

    const connectionData: ConnectionDisplayData = {
      state: isConnected ? 'connected' : 'idle',
      ...(activeSession?.accounts?.[0]?.address && { address: activeSession.accounts[0].address }),
      ...(activeSession?.accounts && { accounts: activeSession.accounts.map((a) => a.address) }),
      ...(activeSession?.chain && {
        chain: {
          chainId: activeSession.chain.chainId,
          name: activeSession.chain.name || 'Unknown',
          chainType: activeSession.chain.chainType,
          required: true,
        },
      }),
    };

    const walletDisplayData: WalletDisplayData[] = Object.values(this.state.entities.wallets).map((w) => ({
      wallet: {
        id: w.id,
        name: w.name,
        icon: w.icon || '',
      },
      status: {
        installed: 'isInstalled' in w ? Boolean((w as Record<string, unknown>)['isInstalled']) : false,
        available: 'isAvailable' in w ? Boolean((w as Record<string, unknown>)['isAvailable']) : false,
        recent: false,
        recommended: false,
      },
      capabilities: {
        chains: w.chains ? w.chains.map((c) => String(c)) : [],
        features: w.features || [],
      },
    }));

    return {
      connection: connectionData,
      wallets: walletDisplayData,
      isOpen: this.state.ui.modalOpen,
    };
  }

  // Private helpers
  private buildState(): WalletMeshState {
    const { sessionId, walletId, addresses, chainId, chainType } = this.currentScenario;

    if (!sessionId) {
      return {
        ui: {
          modalOpen: false,
          currentView: 'walletSelection',
          loading: {
            connection: false,
            discovery: false,
            transaction: false,
          },
          errors: {},
          viewHistory: [],
        },
        entities: {
          wallets: this.getMockWallets().reduce(
            (acc, w) => {
              acc[w.id] = w;
              return acc;
            },
            {} as Record<string, WalletInfo>,
          ),
          sessions: {},
          transactions: {},
        },
        active: {
          walletId: null,
          sessionId: null,
          transactionId: null,
          selectedWalletId: null,
        },
        meta: {
          lastDiscoveryTime: null,
          connectionTimestamps: {},
          availableWalletIds: ['metamask', 'phantom', 'rainbow'],
          discoveryErrors: [],
          transactionStatus: 'idle' as const,
        },
      };
    }

    const accounts: AccountInfo[] = addresses.map((addr, index) => ({
      address: addr,
      name: `Account ${index + 1}`,
      index,
      isDefault: index === 0,
      isActive: index === 0,
    }));

    const defaultAccount: AccountInfo = accounts[0] || {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Default Account',
      index: 0,
      isDefault: true,
      isActive: true,
    };

    const session: SessionState = {
      sessionId,
      walletId: walletId || '',
      status: 'connected',
      accounts,
      activeAccount: defaultAccount,
      chain: {
        chainId: chainId || '0x1',
        chainType: (chainType ?? ChainType.Evm) as ChainType,
        name: this.getChainName(chainId || '0x1'),
        required: true,
      } as ChainSessionInfo,
      provider: {
        instance: {
          request: vi.fn(),
          on: vi.fn(),
          removeAllListeners: vi.fn(),
        } as unknown,
        type: 'eip1193',
        version: '1.0.0',
        multiChainCapable: true,
        supportedMethods: this.currentScenario.methods,
      } as SessionProvider,
      permissions: {
        methods: this.currentScenario.methods,
        events: ['accountsChanged', 'chainChanged'],
      },
      metadata: {
        wallet: {
          name: this.getWalletName(walletId || ''),
          icon: `${walletId}-icon.png`,
        },
        dapp: {
          name: 'Test App',
          url: 'http://localhost:3000',
        },
        connection: {
          initiatedBy: 'user' as const,
          method: 'manual' as const,
        },
      },
      lifecycle: {
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        lastAccessedAt: Date.now(),
        operationCount: 0,
        activeTime: 0,
      },
    };

    const wallets = this.getMockWallets();
    const walletsById = wallets.reduce(
      (acc, wallet) => {
        acc[wallet.id] = wallet;
        return acc;
      },
      {} as Record<string, WalletInfo>,
    );

    return {
      entities: {
        wallets: walletsById,
        sessions: sessionId ? { [sessionId]: session } : {},
        transactions: {},
      },
      ui: {
        modalOpen: false,
        currentView: 'walletSelection',
        viewHistory: [],
        loading: {},
        errors: {},
      },
      active: {
        walletId: walletId || null,
        sessionId: sessionId || null,
        transactionId: null,
        selectedWalletId: null,
      },
      meta: {
        lastDiscoveryTime: null,
        connectionTimestamps: {},
        availableWalletIds: ['metamask', 'phantom', 'rainbow'],
        discoveryErrors: [],
        transactionStatus: 'idle',
      },
    } as WalletMeshState;
  }

  private notifyStateChange() {
    const headlessState = this.toHeadlessState();
    for (const listener of this.stateListeners) {
      listener(headlessState);
    }
  }

  private getMockWallets(): WalletInfo[] {
    // Using type assertion to include extra properties for testing
    const wallets = [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'metamask-icon.png',
        chains: [ChainType.Evm],
        isAvailable: true,
        isInstalled: true,
      },
      {
        id: 'phantom',
        name: 'Phantom',
        icon: 'phantom-icon.png',
        chains: [ChainType.Solana],
        isAvailable: true,
        isInstalled: false,
      },
      {
        id: 'rainbow',
        name: 'Rainbow',
        icon: 'rainbow-icon.png',
        chains: [ChainType.Evm],
        isAvailable: true,
        isInstalled: true,
      },
    ];
    return wallets as WalletInfo[];
  }

  private getWalletName(walletId: string): string {
    const names: Record<string, string> = {
      metamask: 'MetaMask',
      phantom: 'Phantom',
      rainbow: 'Rainbow',
    };
    return names[walletId] || 'Unknown Wallet';
  }

  private getChainName(chainId: ChainId): string {
    const names: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon',
      '0xa': 'Optimism',
    };
    return names[chainId] || 'Unknown Chain';
  }
}

/**
 * Create a fully configured test client with mock behavior
 */
export function createMockClient(scenario?: keyof typeof WalletScenarios): MockWalletMeshClient {
  const client = new MockWalletMeshClient();
  if (scenario) {
    client.setScenario(WalletScenarios[scenario]);
  }
  return client;
}

/**
 * Wait for async updates with timeout
 */
export async function waitForStateUpdate(
  callback: () => void,
  options: { timeout?: number } = {},
): Promise<void> {
  const { timeout = 1000 } = options;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`State update timeout after ${timeout}ms`));
    }, timeout);

    // Use microtask to wait for state updates
    Promise.resolve().then(() => {
      clearTimeout(timeoutId);
      callback();
      resolve();
    });
  });
}

/**
 * Test assertion helpers
 */
export const TestAssertions = {
  // Assert wallet is connected
  assertConnected(client: MockWalletMeshClient) {
    const activeSessionId = client.state.active.sessionId;
    if (!activeSessionId) {
      throw new Error('Expected wallet to be connected');
    }
    const session = client.state.entities.sessions[activeSessionId];
    if (!session || session.status !== 'connected') {
      throw new Error(`Expected status 'connected', got '${session?.status}'`);
    }
    return session;
  },

  // Assert wallet is disconnected
  assertDisconnected(client: MockWalletMeshClient) {
    const activeSessionId = client.state.active.sessionId;
    if (activeSessionId) {
      throw new Error('Expected wallet to be disconnected');
    }
  },

  // Assert specific chain
  assertChain(client: MockWalletMeshClient, expectedChainId: ChainId) {
    const session = this.assertConnected(client);
    if (session.chain?.chainId !== expectedChainId) {
      throw new Error(`Expected chain ${expectedChainId}, got ${session.chain?.chainId}`);
    }
  },

  // Assert transaction was sent
  assertTransactionSent(client: MockWalletMeshClient) {
    const calls = client.sendTransaction.mock.calls;
    if (!calls || calls.length === 0) {
      throw new Error('Expected sendTransaction to be called');
    }
    return calls[0]?.[0];
  },
};
