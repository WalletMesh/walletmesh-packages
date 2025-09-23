/**
 * Pre-built modal test scenarios
 *
 * Provides fluent interface for testing complex modal interactions
 * and state transitions without repetitive setup code.
 */

import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import { ChainType } from '../../types.js';
import type { WalletInfo } from '../../types.js';
import { createMockLogger } from '../helpers/mocks.js';

/**
 * Modal scenario configuration
 */
export interface ModalScenarioConfig {
  initialView?: 'walletSelection' | 'connecting' | 'connected' | 'error';
  wallets?: WalletInfo[];
  autoCloseDelay?: number;
  shouldFailOpen?: boolean;
  error?: string;
}

/**
 * Fluent interface for building modal test scenarios
 */
export class ModalScenarioBuilder {
  private config: ModalScenarioConfig;
  private mockLogger: ReturnType<typeof createMockLogger>;
  private capturedActions: Array<{ action: string; payload?: unknown }> = [];

  constructor() {
    this.config = {
      initialView: 'walletSelection',
      wallets: this.getDefaultWallets(),
      autoCloseDelay: 0,
      shouldFailOpen: false,
    };
    this.mockLogger = createMockLogger();
    this.setupActionCapture();
  }

  /**
   * Set initial modal view
   */
  startsAt(view: 'walletSelection' | 'connecting' | 'connected' | 'error'): this {
    this.config.initialView = view;
    return this;
  }

  /**
   * Configure available wallets
   */
  withWallets(wallets: WalletInfo[]): this {
    this.config.wallets = wallets;
    return this;
  }

  /**
   * Add auto-close after specified delay
   */
  autoCloses(delay: number): this {
    this.config.autoCloseDelay = delay;
    return this;
  }

  /**
   * Configure modal to fail on open
   */
  failsToOpen(error = 'Failed to open modal'): this {
    this.config.shouldFailOpen = true;
    this.config.error = error;
    return this;
  }

  /**
   * Expect specific user action to be triggered
   */
  expectAction(action: string, payload?: unknown): this {
    this.capturedActions.push({ action, payload });
    return this;
  }

  /**
   * Build the modal scenario
   */
  build() {
    const mockController = this.createMockController();
    const mockState = this.createMockState();

    return {
      controller: mockController,
      logger: this.mockLogger,
      state: mockState,
      config: this.config,
      capturedActions: this.capturedActions,

      async open() {
        if (this.config.shouldFailOpen) {
          throw new Error(this.config.error ?? 'Modal failed to open');
        }
        return mockController.open();
      },

      async close() {
        return mockController.close();
      },

      triggerAction: async (action: string, payload?: unknown) => {
        const onAction = this.capturedOnAction;
        if (onAction) {
          return onAction(action, payload);
        }
      },

      getState() {
        return mockState;
      },

      expectActionCalled(action: string, payload?: unknown) {
        const calls =
          (mockController.onAction as MockedFunction<(action: string, payload?: unknown) => void>)?.mock
            .calls || [];
        const matchingCall = calls.find(
          ([callAction, callPayload]) =>
            callAction === action && (payload === undefined || callPayload === payload),
        );
        expect(matchingCall).toBeDefined();
      },
    };
  }

  private createMockController() {
    const mockController = {
      open: vi.fn().mockImplementation(async () => {
        if (this.config.shouldFailOpen) {
          throw new Error(this.config.error ?? 'Mock open failed');
        }
        if (this.config.autoCloseDelay && this.config.autoCloseDelay > 0) {
          setTimeout(() => mockController.close?.(), this.config.autoCloseDelay);
        }
        return undefined;
      }),
      close: vi.fn(),
      connect: vi.fn().mockResolvedValue({
        address: '0x123',
        walletId: 'metamask',
        chainId: '0x1',
      }),
      disconnect: vi.fn().mockResolvedValue(undefined),
      mount: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn(),
      destroy: vi.fn(),
      onAction: vi.fn(),
    };

    return mockController;
  }

  private createMockState() {
    return {
      isOpen: this.config.initialView !== 'walletSelection',
      currentView: this.config.initialView,
      isLoading: this.config.initialView === 'connecting',
      error: this.config.initialView === 'error' ? this.config.error : null,
      wallets: this.config.wallets || [],
      selectedWalletId: null,
      connection: {
        state: this.config.initialView === 'connected' ? 'connected' : 'disconnected',
      },
    };
  }

  private setupActionCapture() {
    // Framework adapters removed - action capture disabled
    this.capturedOnAction = null;
  }

  private capturedOnAction: ((action: string, payload?: unknown) => void) | null = null;

  private getDefaultWallets(): WalletInfo[] {
    return [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml,<svg></svg>',
        chains: [ChainType.Evm],
      },
      {
        id: 'phantom',
        name: 'Phantom',
        icon: 'data:image/svg+xml,<svg></svg>',
        chains: [ChainType.Solana],
      },
    ];
  }
}

/**
 * Error scenario builder for testing error states and recovery
 */
export class ErrorScenarioBuilder {
  private config: {
    errorType: 'connection' | 'wallet' | 'network' | 'user';
    message: string;
    recoverable: boolean;
    retryable: boolean;
  };

  constructor(errorType: 'connection' | 'wallet' | 'network' | 'user') {
    this.config = {
      errorType,
      message: this.getDefaultMessage(errorType),
      recoverable: true,
      retryable: true,
    };
  }

  /**
   * Set custom error message
   */
  withMessage(message: string): this {
    this.config.message = message;
    return this;
  }

  /**
   * Make error non-recoverable (fatal)
   */
  nonRecoverable(): this {
    this.config.recoverable = false;
    this.config.retryable = false;
    return this;
  }

  /**
   * Make error non-retryable but recoverable
   */
  nonRetryable(): this {
    this.config.retryable = false;
    return this;
  }

  /**
   * Build the error scenario
   */
  build() {
    const mockError = {
      code: this.getErrorCode(),
      message: this.config.message,
      category: this.config.errorType,
      fatal: !this.config.recoverable,
    };

    const mockErrorHandler = {
      handleError: vi.fn(),
      clearError: vi.fn(),
      canRecover: vi.fn().mockReturnValue(this.config.recoverable),
      canRetry: vi.fn().mockReturnValue(this.config.retryable),
    };

    return {
      error: mockError,
      errorHandler: mockErrorHandler,
      config: this.config,

      async triggerError() {
        mockErrorHandler.handleError(mockError);
        return mockError;
      },

      async triggerRecovery() {
        if (this.config.recoverable) {
          mockErrorHandler.clearError();
          return true;
        }
        return false;
      },

      expectErrorHandled: () => {
        expect(mockErrorHandler.handleError).toHaveBeenCalledWith(
          expect.objectContaining({
            code: this.getErrorCode(),
            message: this.config.message,
          }),
        );
      },

      expectRecoveryAttempted() {
        expect(mockErrorHandler.clearError).toHaveBeenCalled();
      },
    };
  }

  private getDefaultMessage(errorType: string): string {
    const messages = {
      connection: 'Failed to connect to wallet',
      wallet: 'Wallet not found',
      network: 'Network error occurred',
      user: 'User rejected the request',
    };
    return messages[errorType as keyof typeof messages] || 'Unknown error';
  }

  private getErrorCode(): string {
    const codes = {
      connection: 'connection_failed',
      wallet: 'wallet_not_found',
      network: 'network_error',
      user: 'user_rejected',
    };
    return codes[this.config.errorType as keyof typeof codes] || 'unknown_error';
  }
}

/**
 * Factory functions for common modal scenarios
 */
export const modalScenarios = {
  /**
   * Standard wallet selection modal
   */
  walletSelection: () => new ModalScenarioBuilder().startsAt('walletSelection'),

  /**
   * Modal in connecting state
   */
  connecting: () => new ModalScenarioBuilder().startsAt('connecting'),

  /**
   * Modal in connected state
   */
  connected: () => new ModalScenarioBuilder().startsAt('connected'),

  /**
   * Modal with error state
   */
  error: (message?: string) => {
    const builder = new ModalScenarioBuilder().startsAt('error');
    if (message) {
      builder.failsToOpen(message);
    }
    return builder;
  },

  /**
   * Modal with auto-close
   */
  autoClosing: (delay = 2000) => new ModalScenarioBuilder().autoCloses(delay),

  /**
   * Modal with custom wallets
   */
  customWallets: (wallets: WalletInfo[]) => new ModalScenarioBuilder().withWallets(wallets),

  /**
   * Connection error scenario
   */
  connectionError: () => new ErrorScenarioBuilder('connection'),

  /**
   * User rejection scenario
   */
  userRejection: () => new ErrorScenarioBuilder('user').nonRetryable(),

  /**
   * Network error scenario
   */
  networkError: () => new ErrorScenarioBuilder('network'),

  /**
   * Wallet not found scenario
   */
  walletNotFound: () => new ErrorScenarioBuilder('wallet').nonRecoverable(),
} as const;

/**
 * Test helpers for modal scenarios
 */
export const modalTestHelpers = {
  /**
   * Test modal opens successfully
   */
  expectModalOpens: async (scenario: ReturnType<ModalScenarioBuilder['build']>) => {
    await scenario.open();
    expect(scenario.controller.open).toHaveBeenCalled();
  },

  /**
   * Test modal fails to open
   */
  expectModalFailsToOpen: async (scenario: ReturnType<ModalScenarioBuilder['build']>) => {
    await expect(scenario.open()).rejects.toThrow();
  },

  /**
   * Test action is triggered
   */
  expectActionTriggered: (
    scenario: ReturnType<ModalScenarioBuilder['build']>,
    action: string,
    payload?: unknown,
  ) => {
    scenario.expectActionCalled(action, payload);
  },

  /**
   * Test error handling
   */
  expectErrorHandled: (scenario: ReturnType<ErrorScenarioBuilder['build']>) => {
    scenario.expectErrorHandled();
  },
} as const;
