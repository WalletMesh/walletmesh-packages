/**
 * Centralized mock definitions to eliminate duplication
 *
 * Provides pre-configured mock modules and objects that can be reused
 * across tests instead of creating inline mocks.
 *
 * IMPORTANT: vi.mock() calls cannot be inside functions or objects.
 * Instead, we provide factory functions that create the mock implementations.
 */

import { vi } from 'vitest';

/**
 * Factory functions for creating mock implementations
 * These can be used with vi.mock() in test files
 */
export const mockFactories = {
  /**
   * Create ErrorFactory mock implementation
   */
  createErrorFactoryMock: () => ({
    // biome-ignore lint/style/useNamingConvention: Matching exported object name
    ErrorFactory: {
      create: vi.fn((code, message, category, data, fatal) => {
        const error: {
          code: string;
          message: string;
          category: string;
          data: unknown;
          fatal: boolean;
          recoveryStrategy?: string;
        } = {
          code,
          message,
          category: category || 'general',
          data,
          fatal,
        };

        // Extract recoveryStrategy from data like the real implementation
        if (
          data &&
          typeof data === 'object' &&
          'recoveryStrategy' in data &&
          typeof data.recoveryStrategy === 'string'
        ) {
          error.recoveryStrategy = data.recoveryStrategy;
        }

        return error;
      }),
      connectionFailed: vi.fn((message, data) => ({
        code: 'connection_failed',
        message: message || 'Connection failed',
        category: 'network',
        data,
        recoveryStrategy: 'wait_and_retry',
      })),
      walletNotFound: vi.fn((walletId) => ({
        code: 'wallet_not_found',
        message: walletId ? `${walletId} wallet not found` : 'Wallet not found',
        category: 'wallet',
        recoveryStrategy: 'manual_action',
      })),
      userRejected: vi.fn((operation) => ({
        code: 'user_rejected',
        message: 'User cancelled the operation',
        category: 'user',
        data: operation ? { operation } : undefined,
        recoveryStrategy: 'none',
      })),
      configurationError: vi.fn((message, details) => ({
        code: 'configuration_error',
        message,
        category: 'general',
        data: details ? { details } : undefined,
      })),
      transportError: vi.fn((message, transportType) => ({
        code: 'transport_unavailable',
        message,
        category: 'network',
        data: transportType ? { transportType } : undefined,
      })),
      networkError: vi.fn((message) => ({
        code: 'network_error',
        message: message || 'Network error',
        category: 'network',
      })),
      timeoutError: vi.fn((message, data) => ({
        code: 'request_timeout',
        message: message || 'Request timed out',
        category: 'network',
        data,
      })),
      unknownError: vi.fn((message) => ({
        code: 'unknown_error',
        message: message || 'An unexpected error occurred',
        category: 'general',
        recoveryStrategy: 'none',
      })),
      invalidTransport: vi.fn((message, transportType) => ({
        code: 'invalid_transport',
        message,
        category: 'general',
        data: transportType ? { transportType } : undefined,
      })),
      messageFailed: vi.fn((message, data) => ({
        code: 'message_failed',
        message: message || 'Failed to send message through transport',
        category: 'network',
        data,
      })),
      renderFailed: vi.fn((message, component) => ({
        code: 'render_failed',
        message: message || 'Failed to render component',
        category: 'general',
        data: component ? { component } : undefined,
      })),
      cleanupFailed: vi.fn((message, operation) => ({
        code: 'cleanup_failed',
        message: message || 'Cleanup operation failed',
        category: 'general',
        data: operation ? { operation } : undefined,
      })),
      mountFailed: vi.fn((message, target) => ({
        code: 'mount_failed',
        message: message || 'Failed to mount component',
        category: 'general',
        data: target ? { target } : undefined,
      })),
      transportDisconnected: vi.fn((message, reason) => ({
        code: 'transport_disconnected',
        message: message || 'Transport disconnected',
        category: 'network',
        data: reason ? { reason } : undefined,
      })),
      invalidAdapter: vi.fn((message, adapterType) => ({
        code: 'invalid_adapter',
        message,
        category: 'general',
        data: adapterType ? { adapterType } : undefined,
      })),
      connectorError: vi.fn((walletId, message, code, options) => {
        const errorData: Record<string, unknown> = {
          component: 'connector',
          walletId,
        };

        if (options?.operation) {
          errorData['operation'] = options.operation;
        }

        if (options?.recoveryHint) {
          errorData['recoveryHint'] = options.recoveryHint;
        }

        if (options?.originalError) {
          errorData['originalError'] = String(options.originalError);
        }

        if (options?.data) {
          Object.assign(errorData, options.data);
        }

        return {
          code: code || 'CONNECTOR_ERROR',
          message,
          category: 'wallet',
          data: errorData,
        };
      }),
      fromConnectorError: vi.fn((walletId, error, operation) => {
        const errorMessage = typeof error === 'string' ? error : error.message || '';
        const errorStr = errorMessage.toLowerCase();

        // Pattern detection matching the real implementation
        if (errorStr.includes('user') && (errorStr.includes('reject') || errorStr.includes('denied'))) {
          return {
            code: 'USER_REJECTED',
            message: errorMessage,
            category: 'wallet',
            data: {
              component: 'connector',
              walletId,
              ...(operation && { operation }),
              recoveryHint: 'user_action',
              originalError: String(error),
            },
          };
        }

        if (errorStr.includes('locked') || errorStr.includes('unlock')) {
          return {
            code: 'WALLET_LOCKED',
            message: errorMessage,
            category: 'wallet',
            data: {
              component: 'connector',
              walletId,
              ...(operation && { operation }),
              recoveryHint: 'unlock_wallet',
              originalError: String(error),
            },
          };
        }

        if (
          errorStr.includes('not found') ||
          errorStr.includes('not installed') ||
          errorStr.includes('provider not found')
        ) {
          return {
            code: 'WALLET_NOT_FOUND',
            message: errorMessage,
            category: 'wallet',
            data: {
              component: 'connector',
              walletId,
              ...(operation && { operation }),
              recoveryHint: 'install_wallet',
              originalError: String(error),
            },
          };
        }

        if (errorStr.includes('chain') || errorStr.includes('network')) {
          return {
            code: 'UNSUPPORTED_CHAIN',
            message: errorMessage,
            category: 'wallet',
            data: {
              component: 'connector',
              walletId,
              ...(operation && { operation }),
              recoveryHint: 'switch_chain',
              originalError: String(error),
            },
          };
        }

        if (errorStr.includes('timeout') || errorStr.includes('connect')) {
          return {
            code: 'CONNECTION_FAILED',
            message: errorMessage,
            category: 'wallet',
            data: {
              component: 'connector',
              walletId,
              ...(operation && { operation }),
              recoveryHint: 'retry',
              originalError: String(error),
            },
          };
        }

        return {
          code: 'CONNECTOR_ERROR',
          message: errorMessage,
          category: 'wallet',
          fatal: false,
          data: {
            component: 'connector',
            walletId,
            ...(operation && { operation }),
            originalError: String(error),
          },
        };
      }),
      notFound: vi.fn((message, details) => ({
        code: 'NOT_FOUND',
        message,
        category: 'general',
        data: details,
      })),
      isModalError: vi.fn((error) => {
        return (
          error !== null &&
          typeof error === 'object' &&
          'code' in error &&
          'message' in error &&
          'category' in error
        );
      }),
      timeout: vi.fn((message, data) => ({
        code: 'request_timeout',
        message: message || 'Request timed out',
        category: 'network',
        data,
      })),
      fromError: vi.fn((originalError, component) => ({
        code: 'unknown_error',
        message: originalError instanceof Error ? originalError.message : String(originalError),
        category: 'general',
        data: component
          ? { component, originalError: String(originalError) }
          : { originalError: String(originalError) },
      })),
      validation: vi.fn((message, details) => ({
        code: 'VALIDATION_ERROR',
        message,
        category: 'general',
        data: details,
      })),
      transactionFailed: vi.fn((message, details) => ({
        code: 'TRANSACTION_FAILED',
        message,
        category: 'wallet',
        data: details,
      })),
      transactionReverted: vi.fn((message, details) => ({
        code: 'TRANSACTION_REVERTED',
        message,
        category: 'wallet',
        data: details,
      })),
      gasEstimationFailed: vi.fn((message, details) => ({
        code: 'GAS_ESTIMATION_FAILED',
        message,
        category: 'wallet',
        data: details,
      })),
      simulationFailed: vi.fn((message, details) => ({
        code: 'SIMULATION_FAILED',
        message,
        category: 'wallet',
        data: details,
      })),
      invalidParams: vi.fn((message, details) => ({
        code: 'INVALID_PARAMS',
        message,
        category: 'general',
        data: details,
      })),
      iconValidationFailed: vi.fn((reason, details) => ({
        code: 'ICON_VALIDATION_FAILED',
        message: `Icon validation failed: ${reason}`,
        category: 'validation',
        data: details,
      })),
      sandboxCreationFailed: vi.fn((reason, details) => ({
        code: 'SANDBOX_CREATION_FAILED',
        message: `Failed to create icon sandbox: ${reason}`,
        category: 'sandbox',
        data: details,
      })),
    },
  }),

  /**
   * Create ModalController mock implementation
   */
  createModalControllerMock: () => ({
    // biome-ignore lint/style/useNamingConvention: Matching exported class name
    ModalController: vi.fn().mockImplementation((options) => ({
      options,
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      connect: vi.fn().mockResolvedValue({
        address: '0x123',
        chainId: '0x1',
        walletId: 'metamask',
      }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      mount: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue({
        isOpen: false,
        connection: { state: 'disconnected' },
        wallets: [],
      }),
      destroy: vi.fn(),
    })),
  }),

  /**
   * Create service factories mock implementation
   */
  createServiceFactoriesMock: () => ({
    createCoreServices: vi.fn().mockReturnValue({
      errorHandler: {
        handleError: vi.fn(),
        clearError: vi.fn(),
        setErrorBoundary: vi.fn(),
      },
    }),
    createComponentServices: vi.fn().mockReturnValue({
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        setLevel: vi.fn(),
      },
    }),
  }),

  /**
   * Create unified store mock implementation
   */
  createStoreMock: () => ({
    useStore: {
      getState: vi.fn().mockReturnValue({
        ui: { isOpen: false, currentView: 'walletSelection', isLoading: false },
        connections: {
          activeSessions: [],
          activeSessionId: null,
          wallets: [],
          availableWalletIds: [],
        },
        transactions: {
          history: [],
          current: null,
          status: 'idle',
          error: null,
        },
      }),
      setState: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {}),
    },
    getActiveSession: vi.fn().mockReturnValue(null),
    getSessionsByWallet: vi.fn().mockReturnValue([]),
  }),
};

/**
 * Mock presets for common testing scenarios
 */
export const mockPresets = {
  /**
   * Connection flow preset - mocks for testing wallet connection
   */
  connectionFlow: {
    successful: () => ({
      client: {
        connect: vi.fn().mockResolvedValue({
          address: '0x1234567890123456789012345678901234567890',
          chainId: '0x1',
          walletId: 'metamask',
          provider: { connected: true },
        }),
        disconnect: vi.fn().mockResolvedValue(undefined),
        isConnected: false,
      },
      controller: {
        connect: vi.fn().mockResolvedValue({
          address: '0x1234567890123456789012345678901234567890',
          chainId: '0x1',
          walletId: 'metamask',
        }),
        getState: vi.fn().mockReturnValue({
          connection: { state: 'connected' },
          selectedWalletId: 'metamask',
        }),
      },
    }),

    failed: (error = new Error('Connection failed')) => ({
      client: {
        connect: vi.fn().mockRejectedValue(error),
        disconnect: vi.fn().mockResolvedValue(undefined),
        isConnected: false,
      },
      controller: {
        connect: vi.fn().mockRejectedValue(error),
        getState: vi.fn().mockReturnValue({
          connection: { state: 'error', error },
          selectedWalletId: null,
        }),
      },
    }),

    userRejected: () => {
      const error = { code: 'user_rejected', message: 'User rejected' };
      return {
        client: {
          connect: vi.fn().mockRejectedValue(error),
          disconnect: vi.fn().mockResolvedValue(undefined),
          isConnected: false,
        },
        controller: {
          connect: vi.fn().mockRejectedValue(error),
          getState: vi.fn().mockReturnValue({
            connection: { state: 'error', error },
            selectedWalletId: null,
          }),
        },
      };
    },
  },

  /**
   * Error handling preset - mocks for testing error scenarios
   */
  errorHandling: {
    recoverable: () => ({
      errorHandler: {
        handleError: vi.fn().mockImplementation((error) => {
          console.log('Mock handling recoverable error:', error.message);
        }),
        clearError: vi.fn(),
      },
      error: {
        code: 'connection_failed',
        message: 'Connection failed',
        category: 'network',
        fatal: false,
      },
    }),

    fatal: () => ({
      errorHandler: {
        handleError: vi.fn().mockImplementation((error) => {
          console.log('Mock handling fatal error:', error.message);
        }),
        clearError: vi.fn(),
      },
      error: {
        code: 'user_rejected',
        message: 'User rejected the request',
        category: 'user',
      },
    }),
  },

  /**
   * Transport preset - mocks for testing transport layer
   */
  transport: {
    popup: () => ({
      transport: {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue({ result: 'success' }),
        on: vi.fn(),
        off: vi.fn(),
        isConnected: vi.fn().mockReturnValue(true),
      },
      type: 'popup',
    }),

    extension: () => ({
      transport: {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        send: vi.fn().mockResolvedValue({ result: 'success' }),
        on: vi.fn(),
        off: vi.fn(),
        isConnected: vi.fn().mockReturnValue(true),
      },
      type: 'extension',
    }),
  },
} as const;

/**
 * Utility functions for applying mock presets
 */
export const mockPresetUtils = {
  /**
   * Apply a connection flow preset to an object
   */
  applyConnectionPreset: <T extends Record<string, unknown>>(
    target: T,
    preset: ReturnType<typeof mockPresets.connectionFlow.successful>,
  ): T & typeof preset => {
    return Object.assign(target, preset);
  },

  /**
   * Create a mock with multiple presets applied
   */
  createMockWithPresets: <T extends Record<string, unknown>>(
    base: T,
    ...presets: Array<Record<string, unknown>>
  ): T => {
    return presets.reduce((acc, preset) => Object.assign(acc, preset), base) as T;
  },

  /**
   * Reset all mocks in a preset
   */
  resetPreset: (preset: Record<string, unknown>) => {
    const resetMockRecursively = (obj: unknown) => {
      if (obj && typeof obj === 'object') {
        for (const key in obj as Record<string, unknown>) {
          const value = (obj as Record<string, unknown>)[key];
          if (typeof value === 'function' && 'mockClear' in value) {
            (value as { mockClear: () => void }).mockClear();
          } else if (typeof value === 'object' && value !== null) {
            resetMockRecursively(value);
          }
        }
      }
    };
    resetMockRecursively(preset);
  },
} as const;

/**
 * Helper function to setup mocks in test files
 * Usage:
 * ```ts
 * import { setupMocks } from '@walletmesh/modal-core/testing';
 *
 * // In your test file
 * setupMocks.errorFactory();
 * setupMocks.modalController();
 * ```
 */
export const setupMocks = {
  errorFactory: () => {
    vi.mock('../../internal/core/errors/errorFactory.js', () => mockFactories.createErrorFactoryMock());
  },
  modalController: () => {
    vi.mock('../../internal/modal/controller.js', () => mockFactories.createModalControllerMock());
  },
  serviceFactories: () => {
    vi.mock('../../internal/core/factories/serviceFactory.js', () =>
      mockFactories.createServiceFactoriesMock(),
    );
  },
  store: () => {
    vi.mock('../../state/store.js', () => mockFactories.createStoreMock());
  },
  all: () => {
    setupMocks.errorFactory();
    setupMocks.modalController();
    setupMocks.serviceFactories();
    setupMocks.store();
  },
};
