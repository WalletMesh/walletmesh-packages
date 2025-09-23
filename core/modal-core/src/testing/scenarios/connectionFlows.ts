/**
 * Pre-built connection test scenarios
 *
 * Provides fluent interface for testing complex wallet connection flows
 * without repetitive setup code.
 */

import { vi } from 'vitest';
import { ChainType } from '../../types.js';
import type { ConnectionResult } from '../../types.js';
import { createMockClient, createMockLogger } from '../helpers/mocks.js';

/**
 * Connection scenario configuration
 */
export interface ConnectionScenarioConfig {
  walletId: string;
  address?: string;
  chainId?: string;
  chainType?: ChainType;
  shouldFail?: boolean;
  error?: Error;
  delay?: number;
  retryAttempts?: number;
}

/**
 * Fluent interface for building connection test scenarios
 */
export class ConnectionScenarioBuilder {
  private config: ConnectionScenarioConfig;
  private mockClient: ReturnType<typeof createMockClient>;
  private mockLogger: ReturnType<typeof createMockLogger>;

  constructor(walletId: string) {
    this.config = {
      walletId,
      address: '0x1234567890123456789012345678901234567890',
      chainId: '0x1',
      chainType: ChainType.Evm,
      delay: 0,
      retryAttempts: 0,
    };
    this.mockClient = createMockClient();
    this.mockLogger = createMockLogger();
  }

  /**
   * Set the wallet address for the connection
   */
  withAddress(address: string): this {
    this.config.address = address;
    return this;
  }

  /**
   * Set the chain for the connection
   */
  onChain(chainId: string, chainType: ChainType = ChainType.Evm): this {
    this.config.chainId = chainId;
    this.config.chainType = chainType;
    return this;
  }

  /**
   * Configure connection to fail with specific error
   */
  failsWith(error: string | Error): this {
    this.config.shouldFail = true;
    this.config.error = typeof error === 'string' ? new Error(error) : error;
    return this;
  }

  /**
   * Add delay to connection simulation
   */
  withDelay(ms: number): this {
    this.config.delay = ms;
    return this;
  }

  /**
   * Configure retry attempts
   */
  withRetries(attempts: number): this {
    this.config.retryAttempts = attempts;
    return this;
  }

  /**
   * Build the scenario and return mock objects
   */
  build() {
    // Configure mock client connect behavior
    if (this.config.shouldFail) {
      this.mockClient.connect = vi.fn().mockRejectedValue(this.config.error);
    } else {
      const result: ConnectionResult = {
        address: this.config.address ?? '0x123',
        accounts: [this.config.address ?? '0x123'],
        chain: {
          chainId: this.config.chainId ?? '0x1',
          chainType: this.config.chainType ?? ChainType.Evm,
          name: 'Test Chain',
          required: false,
        },
        provider: { connected: true },
        walletId: this.config.walletId,
        walletInfo: {
          id: this.config.walletId,
          name: this.getWalletName(this.config.walletId),
          icon: 'data:image/svg+xml,<svg></svg>',
          chains: [this.config.chainType || ChainType.Evm],
        },
      };

      if (this.config.delay && this.config.delay > 0) {
        this.mockClient.connect = vi.fn().mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, this.config.delay));
          return result;
        });
      } else {
        this.mockClient.connect = vi.fn().mockResolvedValue(result);
      }
    }

    return {
      client: this.mockClient,
      logger: this.mockLogger,
      config: this.config,
      async run() {
        return this.client.connect(this.config.walletId);
      },
    };
  }

  private getWalletName(walletId: string): string {
    const names: Record<string, string> = {
      metamask: 'MetaMask',
      walletconnect: 'WalletConnect',
      phantom: 'Phantom',
      coinbase: 'Coinbase Wallet',
    };
    return names[walletId] || walletId;
  }
}

/**
 * Modal connection scenario for testing modal + connection integration
 */
export class ModalConnectionScenarioBuilder extends ConnectionScenarioBuilder {
  private modalConfig: {
    shouldOpen?: boolean;
    shouldAutoClose?: boolean;
    autoCloseDelay?: number;
  } = {};

  /**
   * Configure modal to open automatically
   */
  opensModal(): this {
    this.modalConfig.shouldOpen = true;
    return this;
  }

  /**
   * Configure modal to auto-close after connection
   */
  autoClosesModal(delay = 1000): this {
    this.modalConfig.shouldAutoClose = true;
    this.modalConfig.autoCloseDelay = delay;
    return this;
  }

  /**
   * Build modal connection scenario
   */
  override build() {
    const baseScenario = super.build();

    // Add modal-specific mocks
    const mockController = {
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      connect: baseScenario.client.connect,
      getState: vi.fn().mockReturnValue({
        isOpen: this.modalConfig.shouldOpen ?? false,
        connection: { state: 'disconnected' },
        selectedWalletId: null,
      }),
      mount: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
    };

    return {
      ...baseScenario,
      controller: mockController,
      modalConfig: this.modalConfig,
      async run() {
        if (this.modalConfig.shouldOpen) {
          await mockController.open();
        }
        const result = await baseScenario.run();
        if (this.modalConfig.shouldAutoClose) {
          setTimeout(() => mockController.close(), this.modalConfig.autoCloseDelay);
        }
        return result;
      },
    };
  }
}

/**
 * Multi-wallet connection scenario for testing wallet switching
 */
export class MultiWalletScenarioBuilder {
  private wallets: ConnectionScenarioConfig[] = [];

  /**
   * Add a wallet to the scenario
   */
  addWallet(walletId: string): ConnectionScenarioBuilder {
    const builder = new ConnectionScenarioBuilder(walletId);
    const originalBuild = builder.build.bind(builder);

    builder.build = () => {
      const scenario = originalBuild();
      this.wallets.push(scenario.config);
      return scenario;
    };

    return builder;
  }

  /**
   * Build multi-wallet scenario
   */
  build() {
    const scenarios = this.wallets.map((config) => new ConnectionScenarioBuilder(config.walletId).build());

    return {
      scenarios,
      wallets: this.wallets,
      async connectAll() {
        const results = [];
        for (const scenario of scenarios) {
          results.push(await scenario.run());
        }
        return results;
      },
      async connectSequentially() {
        const results = [];
        for (const scenario of scenarios) {
          results.push(await scenario.run());
        }
        return results;
      },
    };
  }
}

/**
 * Factory functions for common connection scenarios
 */
export const connectionScenarios = {
  /**
   * Create a successful MetaMask connection scenario
   */
  successfulMetaMask: () => new ConnectionScenarioBuilder('metamask'),

  /**
   * Create a failed connection scenario
   */
  failedConnection: (walletId: string, error = 'Connection failed') =>
    new ConnectionScenarioBuilder(walletId).failsWith(error),

  /**
   * Create a user rejection scenario
   */
  userRejected: (walletId: string) =>
    new ConnectionScenarioBuilder(walletId).failsWith(new Error('User rejected the request')),

  /**
   * Create a Solana phantom connection scenario
   */
  successfulPhantom: () =>
    new ConnectionScenarioBuilder('phantom')
      .onChain('mainnet-beta', ChainType.Solana)
      .withAddress('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'),

  /**
   * Create a slow connection scenario (for timeout testing)
   */
  slowConnection: (walletId: string, delay = 5000) =>
    new ConnectionScenarioBuilder(walletId).withDelay(delay),

  /**
   * Create a retry scenario
   */
  retryScenario: (walletId: string, attempts = 3) =>
    new ConnectionScenarioBuilder(walletId).withRetries(attempts),

  /**
   * Create modal connection scenario
   */
  modalConnection: (walletId: string) => new ModalConnectionScenarioBuilder(walletId),

  /**
   * Create multi-wallet scenario
   */
  multiWallet: () => new MultiWalletScenarioBuilder(),
} as const;

/**
 * Test helpers for connection scenarios
 */
export const connectionTestHelpers = {
  /**
   * Create a quick successful connection test
   */
  expectSuccessfulConnection: async (scenario: ReturnType<ConnectionScenarioBuilder['build']>) => {
    const result = await scenario.run();
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('walletId');
    expect(result).toHaveProperty('chainId');
    return result;
  },

  /**
   * Create a quick failed connection test
   */
  expectFailedConnection: async (
    scenario: ReturnType<ConnectionScenarioBuilder['build']>,
    expectedError?: string,
  ) => {
    await expect(scenario.run()).rejects.toThrow(expectedError);
  },

  /**
   * Test connection with retries
   */
  expectConnectionWithRetries: async (
    scenario: ReturnType<ConnectionScenarioBuilder['build']>,
    expectedAttempts: number,
  ) => {
    try {
      await scenario.run();
    } catch {
      // Expected to fail
    }
    expect(scenario.client.connect).toHaveBeenCalledTimes(expectedAttempts);
  },
} as const;
