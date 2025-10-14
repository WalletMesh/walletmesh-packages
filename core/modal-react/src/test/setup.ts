import { afterAll, afterEach, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import type { WalletInfo } from '@walletmesh/modal-core';

// IMPROVED: Use the enhanced auto-mocking setup
// import '../test-utils/improvedSetup.js';

// Import the mock setup (comment out for now to isolate issues)
// import '../test-utils/centralizedMocks.js';

// Intercept and suppress stderr output for expected test messages
if (typeof process !== 'undefined' && process.stderr) {
  const originalStderrWrite = process.stderr.write;
  // biome-ignore lint/suspicious/noExplicitAny: Test setup requires dynamic type handling for process.stderr
  process.stderr.write = (chunk: any, ...args: any[]): boolean => {
    const str = chunk?.toString() || '';
    // Suppress known test stderr outputs
    if (
      str.includes('[WalletMesh:React:') ||
      str.includes('Chain service not available') ||
      str.includes('not found in services') ||
      str.includes('The above error occurred in') ||
      str.includes('Consider adding an error boundary')
    ) {
      return true;
    }
    // biome-ignore lint/suspicious/noExplicitAny: Test setup requires dynamic type handling for process.stderr
    return originalStderrWrite.apply(process.stderr, [chunk, ...args] as any);
  };
}

// Global error handler to suppress expected test errors
if (typeof window !== 'undefined') {
  // Track error handler state
  let errorHandlerInstalled = false;
  // Guard window.close in tests to be a no-op to avoid teardown issues.
  try {
    // biome-ignore lint/suspicious/noExplicitAny: test env shim
    const w: any = window as any;
    if (!w.__WM_ORIGINAL_CLOSE__) {
      w.__WM_ORIGINAL_CLOSE__ = w.close?.bind(w) ?? (() => {});
      w.close = () => {
        // Respect opt-out via env if needed
        // no-op in tests to avoid environment teardown issues
        return undefined;
      };
    }
  } catch {
    // ignore
  }

  const installErrorHandlers = () => {
    if (errorHandlerInstalled) return;
    errorHandlerInstalled = true;

    window.addEventListener(
      'error',
      (event) => {
        const message = event.error?.message || event.message || '';
        // Suppress all error boundary test errors
        if (
          typeof message === 'string' &&
          (message.includes('Test error') ||
            message.includes('Default error') ||
            message.includes('Retry error') ||
            message.includes('Rapid error') ||
            message.includes('Context error') ||
            message.includes('List error') ||
            message.includes('Error in lazy component') ||
            message.includes('Error in error handler') ||
            message.includes('useWalletMeshContext must be used within'))
        ) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        return true;
      },
      true,
    );

    window.addEventListener(
      'unhandledrejection',
      (event) => {
        const message = event.reason?.message || event.reason || '';
        // Suppress expected promise rejections in tests
        if (
          typeof message === 'string' &&
          (message.includes('Test error') ||
            message.includes('Chain service not available') ||
            message.includes('WalletMesh client not available'))
        ) {
          event.preventDefault();
          return false;
        }
        return true;
      },
      true,
    );
  };

  // Install handlers immediately
  installErrorHandlers();

  // Also install in beforeEach to ensure they're active
  beforeEach(() => {
    installErrorHandlers();
    // Restore original schedulers before each test
    try {
      const w: any = window as any;
      if (w.__WM_ORIGINAL_RAF__) {
        w.requestAnimationFrame = w.__WM_ORIGINAL_RAF__;
      }
      if (w.__WM_ORIGINAL_CAF__) {
        w.cancelAnimationFrame = w.__WM_ORIGINAL_CAF__;
      }
      if (w.__WM_ORIGINAL_SET_TIMEOUT__) {
        w.setTimeout = w.__WM_ORIGINAL_SET_TIMEOUT__;
      }
      if (w.__WM_ORIGINAL_CLEAR_TIMEOUT__) {
        w.clearTimeout = w.__WM_ORIGINAL_CLEAR_TIMEOUT__;
      }
    } catch {}
  });
}

// Flush and guard schedulers to prevent DOM ops during teardown
afterEach(async () => {
  try {
    // Flush any pending microtasks
    await Promise.resolve();
  } catch {}

  try {
    if (vi.isFakeTimers()) {
      // Run timers twice to flush chained callbacks
      vi.runAllTimers();
      vi.runAllTimers();
      vi.clearAllTimers();
    } else if (typeof window !== 'undefined') {
      const w: any = window as any;
      // Drain a frame if rAF exists
      const originalRaf = w.requestAnimationFrame?.bind(w);
      if (originalRaf) {
        await new Promise<void>((resolve) => originalRaf(() => resolve()));
      }
      // Best-effort macrotask flush
      await new Promise<void>((resolve) => w.setTimeout(resolve, 0));

      // Install guards so no new tasks schedule DOM work during teardown
      if (!w.__WM_ORIGINAL_RAF__) w.__WM_ORIGINAL_RAF__ = w.requestAnimationFrame?.bind(w);
      if (!w.__WM_ORIGINAL_CAF__) w.__WM_ORIGINAL_CAF__ = w.cancelAnimationFrame?.bind(w);
      if (!w.__WM_ORIGINAL_SET_TIMEOUT__) w.__WM_ORIGINAL_SET_TIMEOUT__ = w.setTimeout.bind(w);
      if (!w.__WM_ORIGINAL_CLEAR_TIMEOUT__) w.__WM_ORIGINAL_CLEAR_TIMEOUT__ = w.clearTimeout.bind(w);

      let blocked = false;
      // Helper kept for clarity in previous logic; use inline assignment instead of separate function
      w.requestAnimationFrame = (cb: FrameRequestCallback) => {
        if (blocked) return -1;
        return (w.__WM_ORIGINAL_RAF__ ?? ((fn: any) => setTimeout(fn, 16)))(cb);
      };
      w.cancelAnimationFrame = (id: number) => {
        return (w.__WM_ORIGINAL_CAF__ ?? clearTimeout)(id as unknown as NodeJS.Timeout);
      };
      w.setTimeout = ((...args: any[]) => {
        if (blocked) return -1 as unknown as NodeJS.Timeout;
        return w.__WM_ORIGINAL_SET_TIMEOUT__(...args);
      }) as typeof setTimeout;
      w.clearTimeout = ((id: any) => w.__WM_ORIGINAL_CLEAR_TIMEOUT__(id)) as typeof clearTimeout;

      // Activate block after giving a final tick
      await Promise.resolve();
      blocked = true;
    }
  } catch {
    // ignore
  }
});

// Mock React Query to avoid hook issues in tests
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn().mockImplementation(() => ({
    mount: vi.fn(),
    unmount: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: unknown }) => children,
  useQuery: vi.fn().mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isFetching: false,
    isSuccess: false,
    isError: false,
    refetch: vi.fn(),
    status: 'idle',
  }),
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
  }),
  useQueryClient: vi.fn().mockReturnValue({
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  }),
}));

// Mock the testing module separately
vi.mock('@walletmesh/modal-core/testing', () => ({
  createAutoMockedStore: vi.fn().mockImplementation(() => ({
    getState: vi.fn().mockReturnValue({
      ui: {
        modalOpen: false,
        currentView: 'walletSelection',
        viewHistory: [],
        loading: { connection: false, discovery: false, transaction: false },
        errors: {},
        targetChainType: null,
        isScanning: false,
        walletFilter: null as ((wallet: WalletInfo) => boolean) | null,
      },
      entities: {
        wallets: {},
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
        availableWalletIds: [],
        discoveryErrors: [],
        transactionStatus: 'idle',
      },
    }),
    setState: vi.fn(),
    subscribe: vi.fn().mockReturnValue(() => {}),
    destroy: vi.fn(),
    persist: {
      setOptions: vi.fn(),
      onRehydrateStorage: vi.fn(),
      rehydrate: vi.fn().mockResolvedValue(undefined),
      hasHydrated: vi.fn().mockReturnValue(true),
      getOptions: vi.fn().mockReturnValue({}),
    },
  })),
}));

// Mock problematic Solana imports to prevent test failures
vi.mock('@solana/web3.js', () => ({
  PublicKey: vi.fn().mockImplementation((key) => ({
    toString: () => key,
    toBase58: () => key,
    toBuffer: () => new Uint8Array(),
  })),
  Transaction: vi.fn().mockImplementation(() => ({
    serialize: vi.fn().mockImplementation(() => new Uint8Array([1, 2, 3, 4])),
    from: vi.fn().mockImplementation((data: Uint8Array) => ({ data })),
  })),
  Connection: vi.fn().mockImplementation(() => ({
    getAccountInfo: vi.fn().mockResolvedValue(null),
    getBalance: vi.fn().mockResolvedValue(0),
  })),
  Keypair: vi.fn().mockImplementation(() => ({
    publicKey: { toString: () => 'mockPublicKey' },
    secretKey: new Uint8Array(64),
  })),
  SystemProgram: {
    transfer: vi.fn().mockReturnValue({ keys: [], programId: 'mockProgramId', data: new Uint8Array() }),
  },
}));

// Mock modal-core to prevent actual client creation in tests
vi.mock('@walletmesh/modal-core', () => {
  // Create state that can be updated
  let mockState = {
    ui: {
      modalOpen: false,
      currentView: 'walletSelection',
      viewHistory: [],
      loading: { connection: false, discovery: false, transaction: false },
      errors: {},
      targetChainType: null,
      isScanning: false,
      walletFilter: null as ((wallet: WalletInfo) => boolean) | null,
    },
    entities: {
      wallets: {},
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
      availableWalletIds: [],
      discoveryErrors: [],
      transactionStatus: 'idle',
    },
  };

  // Create a mock store with basic functionality
  const mockStore = {
    getState: vi.fn(() => mockState),
    setState: vi.fn((updater: unknown) => {
      if (typeof updater === 'function') {
        (updater as (state: typeof mockState) => void)(mockState);
      } else if (typeof updater === 'object' && updater !== null) {
        mockState = { ...mockState, ...(updater as Partial<typeof mockState>) };
      }
    }),
    subscribe: vi.fn().mockReturnValue(() => {}),
    destroy: vi.fn(),
    persist: {
      setOptions: vi.fn(),
      onRehydrateStorage: vi.fn(),
      rehydrate: vi.fn().mockResolvedValue(undefined),
      hasHydrated: vi.fn().mockReturnValue(true),
      getOptions: vi.fn().mockReturnValue({}),
    },
  };

  // Create a mock client with basic functionality
  const mockClient = {
    getStore: () => mockStore,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    getQueryManager: vi.fn().mockReturnValue(null),
    getPublicProvider: vi.fn().mockReturnValue(null),
    getWalletProvider: vi.fn().mockReturnValue(null),
    getWalletAdapter: vi.fn().mockReturnValue(null),
    getServices: vi.fn().mockReturnValue({
      connection: {
        connect: vi.fn().mockRejectedValue(new Error('Mock connection failed')),
        disconnect: vi.fn().mockResolvedValue(undefined),
      },
      connectionService: {
        connect: vi.fn().mockRejectedValue(new Error('Mock connection failed')),
        disconnect: vi.fn().mockResolvedValue(undefined),
      },
      balance: {
        getNativeBalance: vi.fn().mockRejectedValue(new Error('Mock balance failed')),
        getTokenBalance: vi.fn().mockRejectedValue(new Error('Mock balance failed')),
      },
      balanceService: {
        getNativeBalance: vi.fn().mockRejectedValue(new Error('Mock balance failed')),
        getTokenBalance: vi.fn().mockRejectedValue(new Error('Mock balance failed')),
      },
      transaction: {
        sendTransaction: vi.fn().mockRejectedValue(new Error('Mock transaction failed')),
        getTransaction: vi.fn().mockRejectedValue(new Error('Mock transaction failed')),
        waitForConfirmation: vi.fn().mockRejectedValue(new Error('Mock transaction failed')),
        estimateGas: vi.fn().mockRejectedValue(new Error('Mock transaction failed')),
      },
      transactionService: {
        sendTransaction: vi.fn().mockRejectedValue(new Error('Mock transaction failed')),
      },
    }),
    destroy: vi.fn(),
  };

  // Set the mock client in global scope for test environment
  if (typeof global !== 'undefined') {
    (global as Record<string, unknown>)['__TEST_WALLET_MESH_CLIENT__'] = mockClient;
  }

  return {
    // Client creation functions
    createWalletMesh: vi.fn().mockResolvedValue(mockClient),
    createWalletMeshClient: vi.fn().mockResolvedValue(mockClient),
    createWalletMeshStore: vi.fn().mockReturnValue(mockStore),
    getWalletMeshStore: vi.fn().mockReturnValue(mockStore),
    getStoreInstance: vi.fn(() => mockStore),
    walletMeshStore: mockStore,
    resetStore: vi.fn(() => {
      // Reset mock state
      mockState = {
        ui: {
          modalOpen: false,
          currentView: 'walletSelection',
          viewHistory: [],
          loading: { connection: false, discovery: false, transaction: false },
          errors: {},
          targetChainType: null,
          isScanning: false,
          walletFilter: null as ((wallet: WalletInfo) => boolean) | null,
        },
        entities: {
          wallets: {},
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
          availableWalletIds: [],
          discoveryErrors: [],
          transactionStatus: 'idle',
        },
      };
    }),
    useWalletMeshStore: vi.fn(() => mockStore),
    useStoreActions: vi.fn().mockReturnValue({
      openModal: vi.fn(),
      closeModal: vi.fn(),
      setView: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
    }),

    // Modal factory
    createModal: vi.fn().mockReturnValue(mockClient),
    createTestModal: vi.fn().mockReturnValue(mockClient),

    // Logger
    createDebugLogger: vi.fn().mockImplementation(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      setLevel: vi.fn(),
      dispose: vi.fn(),
    })),
    LogLevel: {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
    },

    // Utilities
    displayHelpers: {
      truncateAddress: vi.fn((address) => `${address?.slice(0, 6)}...${address?.slice(-4)}`),
      formatBalance: vi.fn((balance) => balance),
      formatChainName: vi.fn((name) => name),
    },
    formatters: {
      formatAddress: vi.fn((address) => address),
      formatBalance: vi.fn((balance) => balance),
      formatChainId: vi.fn((chainId) => chainId),
      formatTimestamp: vi.fn((timestamp) => new Date(timestamp).toISOString()),
    },
    CHAIN_NAMES: {
      aztec: 'Aztec',
      evm: 'Ethereum',
      solana: 'Solana',
    },

    // Type guards
    isWalletInfo: vi.fn().mockReturnValue(true),
    isChainType: vi.fn().mockReturnValue(true),
    isConnectionResult: vi.fn().mockReturnValue(true),

    // Environment utilities
    isServer: vi.fn().mockReturnValue(false),
    isBrowser: vi.fn().mockReturnValue(true),
    hasLocalStorage: vi.fn().mockReturnValue(true),

    // Modal logger used in theme utils
    modalLogger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn((message, error) => console.warn(message, error)), // Call console.warn so tests can spy on it
      error: vi.fn((message, error) => console.error(message, error)), // Call console.error so tests can spy on it
      setLevel: vi.fn(),
      dispose: vi.fn(),
    },

    // SSR utilities (removing duplicates from above)
    ssrState: {
      isServer: false,
      isSsrContext: false,
    },

    // Query keys for invalidation
    queryKeys: {
      balance: {
        all: () => ['balance'],
        native: () => ['balance', 'native'],
        token: () => ['balance', 'token'],
        byAddress: (chainId: string, address: string) => ['balance', chainId, address],
      },
      transaction: {
        all: () => ['transaction'],
        byHash: (hash: string) => ['transaction', hash],
        byAddress: (address: string) => ['transaction', 'address', address],
        detail: (hash: string) => ['transaction', 'detail', hash],
        receipt: (hash: string) => ['transaction', 'receipt', hash],
      },
      wallet: {
        all: () => ['wallet'],
        sessions: (walletId?: string) =>
          walletId ? ['wallet', 'sessions', walletId] : ['wallet', 'sessions'],
        byId: (id: string) => ['wallet', id],
      },
      connection: {
        all: () => ['connection'],
        status: () => ['connection', 'status'],
        active: () => ['connection', 'active'],
      },
      contract: {
        all: () => ['contract'],
        byAddress: (chainId: string, address: string) => ['contract', chainId, address],
        method: (chainId: string, address: string, method: string) => ['contract', chainId, address, method],
        read: (chainId: string, address: string, method: string, params?: unknown[]) =>
          params
            ? ['contract', 'read', chainId, address, method, params]
            : ['contract', 'read', chainId, address, method],
        byChain: (chainId: string) => ['contract', 'chain', chainId],
      },
    },

    // Error Factory
    ErrorFactory: {
      configurationError: vi.fn().mockImplementation((message, details) => {
        const error = new Error(message);
        Object.assign(error, {
          code: 'CONFIGURATION_ERROR',
          category: 'configuration',
          fatal: true,
          data: details,
        });
        return error;
      }),
      connectionFailed: vi.fn().mockImplementation((message, details) => {
        const error = new Error(message);
        Object.assign(error, {
          code: 'CONNECTION_FAILED',
          category: 'connection',
          fatal: false,
          data: details,
        });
        return error;
      }),
      walletNotFound: vi.fn().mockImplementation((walletId) => {
        const error = new Error(`Wallet ${walletId} not found`);
        Object.assign(error, {
          code: 'WALLET_NOT_FOUND',
          category: 'wallet',
          fatal: false,
          data: { walletId },
        });
        return error;
      }),
      invalidParams: vi.fn().mockImplementation((message, details) => {
        const error = new Error(message);
        Object.assign(error, {
          code: 'INVALID_PARAMS',
          category: 'validation',
          fatal: false,
          data: details,
        });
        return error;
      }),
      transactionFailed: vi.fn().mockImplementation((message, details) => {
        const error = new Error(message);
        Object.assign(error, {
          code: 'TRANSACTION_FAILED',
          category: 'transaction',
          fatal: false,
          data: details,
        });
        return error;
      }),
      notFound: vi.fn().mockImplementation((message) => {
        const error = new Error(message);
        Object.assign(error, {
          code: 'NOT_FOUND',
          category: 'validation',
          fatal: false,
        });
        return error;
      }),
      unknownError: vi.fn().mockImplementation((message) => {
        const error = new Error(message);
        Object.assign(error, {
          code: 'UNKNOWN_ERROR',
          category: 'unknown',
          fatal: false,
        });
        return error;
      }),
    },

    // Actions
    actions: {
      setModal: vi.fn(),
      setWallets: vi.fn(),
      addSession: vi.fn(),
      removeSession: vi.fn(),
      setActiveSession: vi.fn(),
      updateSession: vi.fn(),
      addTransaction: vi.fn(),
      updateTransaction: vi.fn(),
      removeTransaction: vi.fn(),
    },

    uiActions: {
      openModal: vi.fn(),
      closeModal: vi.fn(),
      setView: vi.fn(),
      setLoading: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
      setScanning: vi.fn(),
      updateScanTime: vi.fn(),
      addDiscoveryError: vi.fn(),
      clearDiscoveryErrors: vi.fn(),
      startDiscovery: vi.fn((_store: unknown) => {
        mockState.ui.isScanning = true;
      }),
      stopDiscovery: vi.fn((_store: unknown) => {
        mockState.ui.isScanning = false;
      }),
      setWalletFilter: vi.fn((_store: unknown, filter: ((wallet: WalletInfo) => boolean) | null) => {
        mockState.ui.walletFilter = filter;
        // Note: filteredWalletIds doesn't exist in the new state structure
        // The filtering is now handled by selectors in the actual implementation
      }),
      clearWalletFilter: vi.fn((_store: unknown) => {
        mockState.ui.walletFilter = null;
      }),
    },

    connectionActions: {
      setActiveSessions: vi.fn(),
      setAvailableWallets: vi.fn(),
      setDiscoveredWallets: vi.fn(),
      setActiveSessionId: vi.fn(),
      setConnectionStatus: vi.fn(),
      setSelectedWallet: vi.fn(),
      addSession: vi.fn(),
      removeSession: vi.fn(),
      updateSession: vi.fn(),
      clearSessions: vi.fn(),
    },

    transactionActions: {
      addPendingTransaction: vi.fn(),
      updateTransactionStatus: vi.fn(),
      removeTransaction: vi.fn(),
      setActiveTransaction: vi.fn(),
      clearTransactions: vi.fn(),
      clearError: vi.fn(),
    },

    // Store utility functions
    useStore: mockStore,
    getActiveWallet: vi.fn().mockReturnValue(null),
    getActiveSession: vi.fn().mockReturnValue(null),
    getSessionsByWallet: vi.fn().mockReturnValue([]),
    findWalletById: vi.fn().mockReturnValue(null),
    isWalletAvailable: vi.fn().mockReturnValue(false),
    getConnectionStatus: vi.fn().mockReturnValue('disconnected'),
    getFilteredWallets: vi.fn().mockImplementation((state) => {
      // Return wallets filtered by the wallet filter if present
      const wallets = state?.connections?.wallets || [];
      const filter = state?.ui?.walletFilter;
      return filter ? wallets.filter(filter) : wallets;
    }),

    // Export types and enums
    ConnectionStatus: {
      Disconnected: 'disconnected',
      Connecting: 'connecting',
      Connected: 'connected',
      Reconnecting: 'reconnecting',
      Error: 'error',
    },
    ChainType: {
      Aztec: 'aztec',
      EVM: 'evm',
      Solana: 'solana',
    },

    // Error formatter utilities
    ErrorType: {
      ModalError: 'modal_error',
      JavaScriptError: 'js_error',
      StringError: 'string_error',
      UnknownObject: 'unknown_object',
      Unknown: 'unknown',
    },
    formatError: vi.fn().mockImplementation((error) => {
      if (!error) {
        return {
          message: 'An unknown error occurred',
          errorType: 'unknown',
        };
      }

      // Check for ModalError structure
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        'message' in error &&
        'category' in error
      ) {
        return {
          message: error.message,
          code: error.code,
          recoveryHint: error.data?.recoveryHint,
          details: error.data ? JSON.stringify(error.data, null, 2) : undefined,
          errorType: 'modal_error',
        };
      }

      // JavaScript Error with custom properties
      if (error instanceof Error) {
        const errorWithCode = error as Error & { code?: string; data?: { recoveryHint?: string } };
        const result: {
          message: string;
          errorType: string;
          code?: string;
          recoveryHint?: string;
        } = {
          message: error.message,
          errorType: 'js_error',
        };
        if (errorWithCode.code) {
          result.code = errorWithCode.code;
        }
        if (errorWithCode.data?.recoveryHint) {
          result.recoveryHint = errorWithCode.data.recoveryHint;
        }
        return result;
      }

      // String errors
      if (typeof error === 'string') {
        return {
          message: error,
          errorType: 'string_error',
        };
      }

      // Handle nested error object
      if (typeof error === 'object' && 'error' in error) {
        const nestedError = (error as { error: unknown }).error;
        if (nestedError && typeof nestedError === 'object' && 'message' in nestedError) {
          const result: {
            message: string;
            errorType: string;
            code?: string;
          } = {
            message: String((nestedError as { message: unknown }).message),
            errorType: 'unknown_object',
          };
          if ('code' in nestedError) {
            result.code = String((nestedError as { code: unknown }).code);
          }
          return result;
        }
      }

      // Handle objects with message property
      if (typeof error === 'object' && 'message' in error) {
        const result: {
          message: string;
          errorType: string;
          code?: string;
        } = {
          message: String((error as { message: unknown }).message),
          errorType: 'unknown_object',
        };
        if ('code' in error) {
          result.code = String((error as { code: unknown }).code);
        }
        return result;
      }

      // Handle arbitrary objects
      if (typeof error === 'object') {
        try {
          const details = JSON.stringify(error, null, 2);
          return {
            message: `Error details: ${details}`,
            errorType: 'unknown_object',
          };
        } catch {
          return {
            message: 'An error occurred (details unavailable)',
            errorType: 'unknown_object',
          };
        }
      }

      return {
        message: 'An unknown error occurred',
        errorType: 'unknown',
      };
    }),
    getRecoveryMessage: vi.fn().mockImplementation((hint) => {
      if (!hint) return undefined;

      const messages: Record<string, string> = {
        install_wallet: 'Please install the wallet extension and try again.',
        unlock_wallet: 'Please unlock your wallet and try again.',
        switch_chain: 'Please switch to a supported chain in your wallet.',
        retry: 'Please check your internet connection and try again.',
        user_action: 'Please check your browser settings and allow popups for this site.',
      };
      return messages[hint];
    }),
    getErrorTitle: vi.fn().mockReturnValue('Error'),
    isUserInitiatedError: vi.fn().mockReturnValue(false),

    // Theme utilities
    DEFAULT_THEME_STORAGE_KEY: 'walletmesh-theme',
    DEFAULT_CSS_PREFIX: 'walletmesh',
    getSystemTheme: vi.fn().mockReturnValue('light'),
    getStoredTheme: vi.fn().mockReturnValue(null),
    storeTheme: vi.fn(),
    removeStoredTheme: vi.fn(),
    onSystemThemeChange: vi.fn().mockReturnValue(() => {}),
    resolveTheme: vi.fn().mockReturnValue('light'),
    themeConfigToCSSVariables: vi.fn().mockReturnValue({}),
    applyCSSVariables: vi.fn(),
    removeCSSVariables: vi.fn(),
    applyThemeClass: vi.fn(),
    disableTransitions: vi.fn().mockReturnValue(() => {}),
    getNextTheme: vi.fn().mockReturnValue('dark'),
    toggleTheme: vi.fn().mockReturnValue('dark'),
    isValidThemeMode: vi.fn().mockReturnValue(true),

    // Error types
    WalletMeshErrorCode: {
      CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
      CONNECTION_FAILED: 'CONNECTION_FAILED',
      WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
      INVALID_PARAMS: 'INVALID_PARAMS',
      USER_REJECTED: 'USER_REJECTED',
      NETWORK_ERROR: 'NETWORK_ERROR',
    },
    WalletMeshErrors: {
      ConfigurationError: class ConfigurationError extends Error {},
      ConnectionFailedError: class ConnectionFailedError extends Error {},
      WalletNotFoundError: class WalletNotFoundError extends Error {},
      InvalidParamsError: class InvalidParamsError extends Error {},
    },
    createWalletMeshError: vi.fn().mockImplementation((code, message, data) => {
      const error = new Error(message);
      Object.assign(error, { code, data });
      return error;
    }),
    getErrorMessage: vi.fn().mockImplementation((error) => {
      if (error instanceof Error) return error.message;
      if (typeof error === 'string') return error;
      return 'Unknown error';
    }),
    isRecoverableError: vi.fn().mockReturnValue(true),

    // Transport types
    TransportType: {
      Extension: 'extension',
      WalletConnect: 'walletconnect',
      Iframe: 'iframe',
      Direct: 'direct',
    },
    ConnectionState: {
      Disconnected: 'disconnected',
      Connecting: 'connecting',
      Connected: 'connected',
      Reconnecting: 'reconnecting',
      Error: 'error',
    },

    // Chain configurations - Aztec
    aztecSandbox: { chainId: 'aztec:31337', name: 'Aztec Sandbox', chainType: 'aztec', id: 'aztec-sandbox' },
    aztecTestnet: {
      chainId: 'aztec:testnet',
      name: 'Aztec Testnet',
      chainType: 'aztec',
      id: 'aztec-testnet',
    },
    aztecMainnet: {
      chainId: 'aztec:mainnet',
      name: 'Aztec Mainnet',
      chainType: 'aztec',
      id: 'aztec-mainnet',
    },
    aztecChains: [
      { id: 'aztec-sandbox', name: 'Aztec Sandbox', chainType: 'aztec' },
      { id: 'aztec-testnet', name: 'Aztec Testnet', chainType: 'aztec' },
      { id: 'aztec-mainnet', name: 'Aztec Mainnet', chainType: 'aztec' },
    ],
    aztecMainnets: [{ id: 'aztec-mainnet', name: 'Aztec Mainnet', chainType: 'aztec' }],
    aztecTestChains: [
      { id: 'aztec-sandbox', name: 'Aztec Sandbox', chainType: 'aztec' },
      { id: 'aztec-testnet', name: 'Aztec Testnet', chainType: 'aztec' },
    ],

    // Chain configurations - EVM
    ethereumMainnet: { id: 1, name: 'Ethereum', chainType: 'evm' },
    ethereumSepolia: { id: 11155111, name: 'Sepolia', chainType: 'evm' },
    ethereumHolesky: { id: 17000, name: 'Holesky', chainType: 'evm' },
    polygonMainnet: { id: 137, name: 'Polygon', chainType: 'evm' },
    polygonAmoy: { id: 80002, name: 'Polygon Amoy', chainType: 'evm' },
    arbitrumOne: { id: 42161, name: 'Arbitrum One', chainType: 'evm' },
    arbitrumSepolia: { id: 421614, name: 'Arbitrum Sepolia', chainType: 'evm' },
    optimismMainnet: { id: 10, name: 'Optimism', chainType: 'evm' },
    optimismSepolia: { id: 11155420, name: 'Optimism Sepolia', chainType: 'evm' },
    baseMainnet: { id: 8453, name: 'Base', chainType: 'evm' },
    baseSepolia: { id: 84532, name: 'Base Sepolia', chainType: 'evm' },
    evmMainnets: [
      { id: 1, name: 'Ethereum', chainType: 'evm' },
      { id: 137, name: 'Polygon', chainType: 'evm' },
      { id: 42161, name: 'Arbitrum One', chainType: 'evm' },
      { id: 10, name: 'Optimism', chainType: 'evm' },
      { id: 8453, name: 'Base', chainType: 'evm' },
    ],
    evmTestnets: [
      { id: 11155111, name: 'Sepolia', chainType: 'evm' },
      { id: 17000, name: 'Holesky', chainType: 'evm' },
      { id: 80002, name: 'Polygon Amoy', chainType: 'evm' },
      { id: 421614, name: 'Arbitrum Sepolia', chainType: 'evm' },
      { id: 11155420, name: 'Optimism Sepolia', chainType: 'evm' },
      { id: 84532, name: 'Base Sepolia', chainType: 'evm' },
    ],
    evmChains: [], // Populated dynamically

    // Chain configurations - Solana
    solanaMainnet: { id: 'solana-mainnet', name: 'Solana Mainnet', chainType: 'solana' },
    solanaDevnet: { id: 'solana-devnet', name: 'Solana Devnet', chainType: 'solana' },
    solanaTestnet: { id: 'solana-testnet', name: 'Solana Testnet', chainType: 'solana' },
    solanaChains: [
      { id: 'solana-mainnet', name: 'Solana Mainnet', chainType: 'solana' },
      { id: 'solana-devnet', name: 'Solana Devnet', chainType: 'solana' },
      { id: 'solana-testnet', name: 'Solana Testnet', chainType: 'solana' },
    ],
    solanaMainnets: [{ id: 'solana-mainnet', name: 'Solana Mainnet', chainType: 'solana' }],
    solanaTestChains: [
      { id: 'solana-devnet', name: 'Solana Devnet', chainType: 'solana' },
      { id: 'solana-testnet', name: 'Solana Testnet', chainType: 'solana' },
    ],

    // Chain config helpers
    createEvmMainnetConfig: vi.fn(),
    createEvmTestnetConfig: vi.fn(),
    createAllChainsConfig: vi.fn(),
    markChainsRequired: vi.fn(),
    filterChainsByGroup: vi.fn(),
    isChainSupported: vi.fn(),
    getRequiredChains: vi.fn(),

    // Config creation functions
    createMainnetConfig: vi.fn(),
    createTestnetConfig: vi.fn(),

    // Icon components
    WalletMeshSandboxedIcon: vi.fn().mockImplementation(() => null),
    WalletMeshSandboxedWalletIcon: vi.fn().mockImplementation(() => null),
    createSandboxedIcon: vi.fn().mockImplementation(() => () => null),
    createSandboxedIcons: vi.fn().mockImplementation(() => ({})),
    isSandboxSupported: vi.fn().mockReturnValue(true),

    // SSR utilities
    useHasMounted: vi.fn().mockReturnValue(true),
    useClientOnly: vi.fn().mockImplementation((value) => value),
    safeBrowserAPI: vi.fn().mockImplementation((fn) => fn()),
    createSSRWalletMesh: vi.fn(),
    serializeState: vi.fn().mockImplementation((state) => JSON.stringify(state)),
    deserializeState: vi.fn().mockImplementation((state) => JSON.parse(state)),

    // Provider components
    EvmProvider: vi.fn().mockImplementation(({ children }) => children),
  };
});

// Mock the useWalletEvents hook to avoid complex store subscriptions that cause test hangs
vi.mock('../hooks/useWalletEvents.js', () => {
  const createMockUseWalletEvents = () => {
    let isPausedState = false;

    return {
      on: vi.fn().mockReturnValue(() => {}),
      off: vi.fn(),
      once: vi.fn().mockReturnValue(() => {}),
      pause: vi.fn().mockImplementation(() => {
        isPausedState = true;
      }),
      resume: vi.fn().mockImplementation(() => {
        isPausedState = false;
      }),
      get isPaused() {
        return isPausedState;
      },
      activeEvents: [],
    };
  };

  return {
    useWalletEvents: vi.fn(() => createMockUseWalletEvents()),
    // Re-export types
    type: {},
  };
});

// Mock window.matchMedia BEFORE beforeEach so it doesn't get restored
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
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

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scroll into view
Element.prototype.scrollIntoView = vi.fn();

// IMPROVED: Enhanced test setup with better cleanup
// Note: Most setup is now handled in improvedSetup.js
beforeEach(() => {
  // Setup fake timers for all tests
  vi.useFakeTimers();

  // Clear all mocks before each test
  vi.clearAllMocks();
  // Don't restore all mocks since we need persistent mocks like window.matchMedia
  // vi.restoreAllMocks();

  // Re-establish the matchMedia mock after each test to ensure it's always available
  if (typeof window !== 'undefined' && (!window.matchMedia || typeof window.matchMedia !== 'function')) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
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
  }
});

afterEach(() => {
  // Clean up any pending async operations and timers
  try {
    vi.clearAllTimers();
    vi.useRealTimers();
  } catch (error) {
    // Ignore timer cleanup errors to prevent hanging
  }
});

// Global cleanup after all tests complete
afterAll(() => {
  // Final cleanup to ensure nothing is hanging
  vi.useRealTimers();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  // Force cleanup of any remaining handles
  if (typeof global !== 'undefined' && global.gc) {
    global.gc();
  }
});

// Mock window dimensions
if (typeof window !== 'undefined') {
  Object.defineProperties(window, {
    innerWidth: {
      value: 1024,
      writable: true,
      configurable: true,
    },
    innerHeight: {
      value: 768,
      writable: true,
      configurable: true,
    },
    outerWidth: {
      value: 1024,
      writable: true,
      configurable: true,
    },
    outerHeight: {
      value: 768,
      writable: true,
      configurable: true,
    },
  });
}

// Mock navigator if not present
if (typeof window !== 'undefined' && !window.navigator) {
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Testing) Vitest',
      clipboard: {
        writeText: vi.fn(),
        readText: vi.fn(),
      },
    },
    writable: true,
    configurable: true,
  });
}

// Suppress specific console warnings
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

console.error = (...args: unknown[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress known test-related errors
    if (
      message.includes('inside a test was not wrapped in act') ||
      message.includes('The above error occurred in the') ||
      message.includes('Consider adding an error boundary') ||
      message.includes('[WalletMesh:React:') ||
      message.includes('service not available') ||
      message.includes('not found in services')
    ) {
      return;
    }
  }
  originalError.call(console, ...args);
};

console.warn = (...args: unknown[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress known test-related warnings
    if (
      message.includes('Chain service not available') ||
      message.includes('Client does not have getServices method')
    ) {
      return;
    }
  }
  originalWarn.call(console, ...args);
};

console.log = (...args: unknown[]) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress known test-related logs
    if (
      message.includes('[WalletMesh:React:') ||
      message.includes('Chain service not available') ||
      message.includes('Client does not have getServices method') ||
      message.includes('CREATE_WALLET_MESH_TRACE') ||
      message.includes('[[WalletClient]]') ||
      message.includes('ServiceRegistry initialized') ||
      message.includes('dApp RPC service initialized')
    ) {
      return;
    }
  }
  originalLog.call(console, ...args);
};
