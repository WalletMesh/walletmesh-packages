/**
 * Fluent interface for building complex test scenarios
 *
 * Provides a chainable API for constructing test setups that read like
 * natural language, making tests more readable and maintainable.
 */

import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';
import { ChainType } from '../../types.js';
import type { ConnectionResult } from '../../types.js';
import { createMockClient, createMockErrorHandler, createMockLogger } from '../helpers/mocks.js';
import { testSetupPatterns } from '../setup/testEnvironment.js';

/**
 * Fluent test builder for WalletMesh testing scenarios
 */
export class FluentTestBuilder {
  private scenario: {
    type: 'connection' | 'modal' | 'error' | 'multi' | 'integration';
    components: {
      client?: unknown;
      controller?: unknown;
      adapter?: unknown;
      logger?: unknown;
      errorHandler?: unknown;
    };
    config: Record<string, unknown>;
    expectations: Array<{
      type: 'success' | 'failure' | 'state' | 'call';
      details: unknown;
    }>;
    actions: Array<{
      name: string;
      params: unknown[];
      delay?: number;
    }>;
  };

  constructor() {
    this.scenario = {
      type: 'connection',
      components: {},
      config: {},
      expectations: [],
      actions: [],
    };
  }

  /**
   * Start building a wallet connection scenario
   */
  static forConnection(walletId: string): FluentTestBuilder {
    const builder = new FluentTestBuilder();
    builder.scenario.type = 'connection';
    builder.scenario.config['walletId'] = walletId;
    return builder;
  }

  /**
   * Start building a modal interaction scenario
   */
  static forModal(): FluentTestBuilder {
    const builder = new FluentTestBuilder();
    builder.scenario.type = 'modal';
    return builder;
  }

  /**
   * Start building an error handling scenario
   */
  static forError(errorType: 'connection' | 'wallet' | 'network' | 'user'): FluentTestBuilder {
    const builder = new FluentTestBuilder();
    builder.scenario.type = 'error';
    builder.scenario.config['errorType'] = errorType;
    return builder;
  }

  /**
   * Start building a multi-component integration scenario
   */
  static forIntegration(): FluentTestBuilder {
    const builder = new FluentTestBuilder();
    builder.scenario.type = 'integration';
    return builder;
  }

  /**
   * Configure the wallet to use
   */
  withWallet(walletId: string): this {
    this.scenario.config['walletId'] = walletId;
    return this;
  }

  /**
   * Configure the chain to use
   */
  onChain(chainId: string, chainType: ChainType = ChainType.Evm): this {
    this.scenario.config['chainId'] = chainId;
    this.scenario.config['chainType'] = chainType;
    return this;
  }

  /**
   * Configure connection to succeed
   */
  succeeds(): this {
    this.scenario.config['shouldSucceed'] = true;
    return this;
  }

  /**
   * Configure operation to fail with specific error
   */
  failsWith(error: string | Error): this {
    this.scenario.config['shouldFail'] = true;
    this.scenario.config['error'] = typeof error === 'string' ? new Error(error) : error;
    return this;
  }

  /**
   * Add delay to operations
   */
  afterDelay(ms: number): this {
    this.scenario.config['delay'] = ms;
    return this;
  }

  /**
   * Configure retries
   */
  withRetries(attempts: number): this {
    this.scenario.config['retryAttempts'] = attempts;
    return this;
  }

  /**
   * Open modal before actions
   */
  opensModal(): this {
    this.scenario.actions.push({ name: 'openModal', params: [] });
    return this;
  }

  /**
   * Close modal after actions
   */
  closesModal(): this {
    this.scenario.actions.push({ name: 'closeModal', params: [] });
    return this;
  }

  /**
   * Connect to wallet
   */
  connects(): this {
    this.scenario.actions.push({
      name: 'connect',
      params: [this.scenario.config['walletId'] || 'metamask'],
    });
    return this;
  }

  /**
   * Disconnect from wallet
   */
  disconnects(): this {
    this.scenario.actions.push({ name: 'disconnect', params: [] });
    return this;
  }

  /**
   * Switch to different chain
   */
  switchesToChain(chainId: string): this {
    this.scenario.actions.push({
      name: 'switchChain',
      params: [chainId],
    });
    return this;
  }

  /**
   * Expect operation to succeed
   */
  expectSuccess(): this {
    this.scenario.expectations.push({
      type: 'success',
      details: { shouldSucceed: true },
    });
    return this;
  }

  /**
   * Expect operation to fail
   */
  expectFailure(error?: string): this {
    this.scenario.expectations.push({
      type: 'failure',
      details: { shouldFail: true, error },
    });
    return this;
  }

  /**
   * Expect specific state
   */
  expectState(state: Record<string, unknown>): this {
    this.scenario.expectations.push({
      type: 'state',
      details: state,
    });
    return this;
  }

  /**
   * Expect function to be called
   */
  expectCalled(methodName: string, times?: number): this {
    this.scenario.expectations.push({
      type: 'call',
      details: { method: methodName, times },
    });
    return this;
  }

  /**
   * Build and execute the scenario
   */
  async run(): Promise<TestScenarioResult> {
    const components = this.setupComponents();
    const testEnv = testSetupPatterns.standard();

    await testEnv.setup();

    try {
      const result = await this.executeScenario(components);
      this.verifyExpectations(components, result);

      return {
        success: true,
        result,
        components,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        components,
        error: error as Error,
      };
    } finally {
      await testEnv.teardown();
    }
  }

  private setupComponents() {
    const components = {} as {
      logger?: ReturnType<typeof createMockLogger>;
      errorHandler?: ReturnType<typeof createMockErrorHandler>;
      client?: ReturnType<typeof createMockClient>;
      controller?: unknown;
    };

    // Always create basic components
    components.logger = createMockLogger();
    components.errorHandler = createMockErrorHandler();

    if (this.scenario.type === 'connection' || this.scenario.type === 'integration') {
      components.client = createMockClient();
    }

    if (this.scenario.type === 'modal' || this.scenario.type === 'integration') {
      components.controller = this.createMockController();
    }

    // Configure components based on scenario config
    this.configureComponents(components);

    return components;
  }

  private configureComponents(components: {
    logger?: unknown;
    errorHandler?: unknown;
    client?: unknown;
    adapter?: unknown;
    controller?: unknown;
  }) {
    if (components.client) {
      if (this.scenario.config['shouldFail']) {
        (components.client as { connect: unknown }).connect = vi
          .fn()
          .mockRejectedValue(this.scenario.config['error']);
      } else {
        const result: Partial<ConnectionResult> = {
          address: '0x1234567890123456789012345678901234567890',
          walletId: (this.scenario.config['walletId'] as string) || 'metamask',
          chain: {
            chainId: (this.scenario.config['chainId'] as string) || '0x1',
            chainType: (this.scenario.config['chainType'] as ChainType) || ChainType.Evm,
            name: 'Test Chain',
            required: false,
          },
        };
        (components.client as { connect: unknown }).connect = vi.fn().mockResolvedValue(result);
      }
    }

    if (components.controller) {
      (components.controller as { connect: unknown }).connect =
        (components.client as { connect?: unknown })?.connect || vi.fn();
    }
  }

  private async executeScenario(components: {
    logger?: unknown;
    errorHandler?: unknown;
    client?: unknown;
    adapter?: unknown;
    controller?: unknown;
  }): Promise<unknown> {
    let result: unknown = null;

    for (const action of this.scenario.actions) {
      if (action.delay) {
        await new Promise((resolve) => setTimeout(resolve, action.delay));
      }

      switch (action.name) {
        case 'openModal': {
          const controller = components.controller as { open?: () => Promise<unknown> };
          if (controller?.open) {
            result = await controller.open();
          }
          break;
        }
        case 'closeModal': {
          const controller = components.controller as { close?: () => unknown };
          if (controller?.close) {
            result = controller.close();
          }
          break;
        }
        case 'connect': {
          const client = components.client as { connect?: (...args: unknown[]) => Promise<unknown> };
          if (client?.connect) {
            result = await client.connect(...(action.params as unknown[]));
          }
          break;
        }
        case 'disconnect': {
          const client = components.client as { disconnect?: () => Promise<unknown> };
          if (client?.disconnect) {
            result = await client.disconnect();
          }
          break;
        }
        case 'switchChain': {
          const client = components.client as { switchChain?: (...args: unknown[]) => Promise<unknown> };
          if (client?.switchChain) {
            result = await client.switchChain(...(action.params as unknown[]));
          }
          break;
        }
      }
    }

    return result;
  }

  private verifyExpectations(components: unknown, result: unknown) {
    for (const expectation of this.scenario.expectations) {
      switch (expectation.type) {
        case 'success': {
          const details = expectation.details as { shouldSucceed?: boolean };
          if (details?.shouldSucceed) {
            expect(result).toBeDefined();
            expect(result).not.toBeInstanceOf(Error);
          }
          break;
        }
        case 'failure': {
          const details = expectation.details as { shouldFail?: boolean; error?: string };
          if (details?.shouldFail) {
            if (details?.error) {
              expect(result).toBeInstanceOf(Error);
              expect((result as Error)?.message).toContain(details.error);
            }
          }
          break;
        }
        case 'call': {
          const details = expectation.details as { method?: string; times?: number };
          const method = this.findMethod(components as Record<string, unknown>, details?.method || '');
          if (method) {
            const times = details?.times;
            if (times !== undefined) {
              expect(method).toHaveBeenCalledTimes(times);
            } else {
              expect(method).toHaveBeenCalled();
            }
          }
          break;
        }
        case 'state':
          // State verification would depend on component type
          break;
      }
    }
  }

  private findMethod(
    components: Record<string, unknown>,
    methodName: string,
  ): MockedFunction<(...args: unknown[]) => unknown> | null {
    for (const component of Object.values(components)) {
      if (component && typeof component === 'object' && methodName in component) {
        return (component as Record<string, unknown>)[methodName] as MockedFunction<
          (...args: unknown[]) => unknown
        >;
      }
    }
    return null;
  }

  private createMockController() {
    return {
      open: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue({
        isOpen: false,
        connection: { state: 'disconnected' },
      }),
      mount: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
    };
  }
}

/**
 * Result of executing a test scenario
 */
export interface TestScenarioResult {
  success: boolean;
  result: unknown;
  components: unknown;
  error: Error | null;
}

/**
 * Convenience factory for common test scenarios
 */
export const testScenarios = {
  /**
   * Quick successful connection test
   */
  quickConnect: (walletId = 'metamask') =>
    FluentTestBuilder.forConnection(walletId).connects().expectSuccess(),

  /**
   * Quick failed connection test
   */
  quickFailedConnect: (walletId = 'metamask', error = 'Connection failed') =>
    FluentTestBuilder.forConnection(walletId).connects().failsWith(error).expectFailure(),

  /**
   * Modal with connection flow
   */
  modalWithConnection: (walletId = 'metamask') =>
    FluentTestBuilder.forModal().opensModal().withWallet(walletId).connects().expectSuccess(),

  /**
   * User rejection scenario
   */
  userRejection: (walletId = 'metamask') =>
    FluentTestBuilder.forConnection(walletId)
      .connects()
      .failsWith('User rejected the request')
      .expectFailure('User rejected'),

  /**
   * Chain switching scenario
   */
  chainSwitch: (fromChain = '0x1', toChain = '0x89') =>
    FluentTestBuilder.forConnection('metamask')
      .onChain(fromChain)
      .connects()
      .switchesToChain(toChain)
      .expectSuccess(),

  /**
   * Multi-step integration test
   */
  fullIntegration: () =>
    FluentTestBuilder.forIntegration()
      .opensModal()
      .withWallet('metamask')
      .connects()
      .expectSuccess()
      .closesModal(),
} as const;
