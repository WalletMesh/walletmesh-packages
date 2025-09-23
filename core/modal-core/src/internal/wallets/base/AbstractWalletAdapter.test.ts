import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WalletAdapterConnectionState, WalletConnection } from '../../../api/types/connection.js';
import type { ProviderClass, WalletProvider } from '../../../api/types/providers.js';
import {
  createMockJSONRPCTransport,
  createMockTransport,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import { ChainType, TransportType } from '../../../types.js';
import type { Transport } from '../../../types.js';
import type { ModalError } from '../../core/errors/types.js';
import { AbstractWalletAdapter } from './AbstractWalletAdapter.js';
import type {
  AdapterContext,
  AdapterEvent,
  ConnectOptions,
  EventHandler,
  WalletAdapterMetadata,
  WalletCapabilities,
} from './WalletAdapter.js';

// Install domain-specific matchers
installCustomMatchers();

// Mock the createTransport module
vi.mock('../../../api/transports/transports.js', () => ({
  createTransport: vi.fn(),
}));

// Mock the TransportToJsonrpcAdapter
type MockTransportAdapter = {
  send: ReturnType<typeof vi.fn>;
  sendBatch: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
};

let mockTransportAdapter: MockTransportAdapter;
// let TransportToJsonrpcAdapterMock: ReturnType<typeof vi.fn>; // Adapters removed

// vi.mock('../../adapters/TransportToJsonrpcAdapter.js', () => ({
//   TransportToJsonrpcAdapter: vi.fn(),
// })); // Adapters removed

// Mock concrete implementation for testing
class DebugWalletAdapter extends AbstractWalletAdapter {
  id = 'debug-wallet';
  metadata: WalletAdapterMetadata = {
    name: 'Debug Wallet',
    icon: 'test-icon.svg',
    description: 'Debug wallet for unit tests',
  };
  capabilities: WalletCapabilities = {
    chains: [
      {
        type: ChainType.Evm,
        chainIds: '*',
      },
    ],
    features: new Set(['sign_message', 'sign_typed_data']),
  };

  // Mock methods - must be implemented since they're abstract
  async connect(options?: ConnectOptions): Promise<WalletConnection> {
    // Simulate connection using base class helper
    const mockProvider = {} as WalletProvider;
    return this.createConnection({
      address: '0x123',
      accounts: ['0x123'],
      chainId: '0x1',
      chainType: ChainType.Evm,
      provider: mockProvider,
    });
  }

  async disconnect(): Promise<void> {
    await this.cleanup();
  }

  // Override optional method for testing
  getJSONRPCTransport(chainType: ChainType): JSONRPCTransport | undefined {
    if (chainType === ChainType.Evm) {
      return createMockJSONRPCTransport();
    }
    return undefined;
  }

  // Expose protected methods for testing
  public testEmitBlockchainEvent(
    event: 'accountsChanged' | 'chainChanged' | 'disconnected',
    data: unknown,
  ): void {
    this.emitBlockchainEvent(event, data);
  }

  public async testCreateTransport(type: TransportType, config: unknown): Promise<Transport> {
    return this.createTransport(type, config);
  }

  public async testCreateProvider(
    ProviderClass: ProviderClass,
    transport: Transport | JSONRPCTransport,
    chainType: ChainType = ChainType.Evm,
    chainId?: string,
  ): Promise<WalletProvider> {
    return this.createProvider(ProviderClass, transport, chainType, chainId);
  }

  public async testCreateConnection(params: {
    address: string;
    accounts: string[];
    chainId: string;
    chainType: ChainType;
    provider: WalletProvider;
    providerType?: string;
    features?: string[];
  }): Promise<WalletConnection> {
    return this.createConnection(params);
  }
}

/**
 * AbstractWalletAdapter Tests
 *
 * Comprehensive tests for AbstractWalletAdapter with organized structure:
 * - Core Functionality (properties, construction, state management)
 * - Event Management (subscriptions, emissions, handlers)
 * - Connection Lifecycle (connect, disconnect, provider access)
 * - Infrastructure & Utilities (transports, providers, helpers)
 * - Error Handling & Edge Cases (cleanup, recovery, validation)
 *
 * @internal
 */

describe('AbstractWalletAdapter', () => {
  let adapter: DebugWalletAdapter;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    // Set up the mock implementation after clearing mocks
    mockTransportAdapter = {
      send: vi.fn(),
      sendBatch: vi.fn(),
      close: vi.fn(),
      request: vi.fn(),
    };

    // const { TransportToJsonrpcAdapter } = await import('../../adapters/TransportToJsonrpcAdapter.js'); // Adapters removed
    // TransportToJsonrpcAdapterMock = TransportToJsonrpcAdapter as ReturnType<typeof vi.fn>;
    // TransportToJsonrpcAdapterMock.mockImplementation(() => mockTransportAdapter);

    adapter = new DebugWalletAdapter();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Core Functionality', () => {
    describe('Basic properties', () => {
      it('should have required properties', () => {
        expect(adapter.id).toBe('debug-wallet');
        expect(adapter.metadata.name).toBe('Debug Wallet');
        expect(adapter.capabilities.chains).toHaveLength(1);
        expect(adapter.capabilities.chains[0].type).toBe(ChainType.Evm);
        expect(adapter.state.status).toBe('disconnected');
        expect(adapter.connection).toBeNull();
      });

      it('should have default empty supportedProviders', () => {
        expect(adapter.supportedProviders).toEqual({});
      });
    });
  }); // End of Core Functionality

  describe('Event Management', () => {
    describe('Event handling', () => {
      it('should subscribe to events with on()', () => {
        const handler = vi.fn();
        const unsubscribe = adapter.on('connection:established', handler);

        // Emit event
        adapter['eventEmitter'].emit('connection:established', {
          connection: {
            address: '0x123',
            accounts: ['0x123'],
            chainId: '0x1',
            chainType: ChainType.Evm,
            features: [],
            provider: {} as WalletProvider,
            providerType: 'unknown',
            walletId: 'debug-wallet',
            metadata: {
              name: 'Debug Wallet',
              icon: 'test-icon.svg',
            },
          },
        });

        expect(handler).toHaveBeenCalled();
        expect(unsubscribe).toBeTypeOf('function');
      });

      it('should unsubscribe from events', () => {
        const handler = vi.fn();
        const unsubscribe = adapter.on('connection:established', handler);

        // Unsubscribe
        unsubscribe();

        // Emit event - handler should not be called
        adapter['eventEmitter'].emit('connection:established', {
          connection: {} as WalletConnection,
        });

        expect(handler).not.toHaveBeenCalled();
      });

      it('should subscribe to one-time events with once()', () => {
        const handler = vi.fn();
        const unsubscribe = adapter.once('connection:lost', handler);

        // Emit event twice
        adapter['eventEmitter'].emit('connection:lost', { reason: 'test' });
        adapter['eventEmitter'].emit('connection:lost', { reason: 'test' });

        // Handler should only be called once
        expect(handler).toHaveBeenCalledTimes(1);
        expect(unsubscribe).toBeTypeOf('function');
      });

      it('should unsubscribe from one-time events', () => {
        const handler = vi.fn();
        const unsubscribe = adapter.once('connection:lost', handler);

        // Unsubscribe before event
        unsubscribe();

        // Emit event - handler should not be called
        adapter['eventEmitter'].emit('connection:lost', { reason: 'test' });

        expect(handler).not.toHaveBeenCalled();
      });

      it('should handle off() method', () => {
        const handler = vi.fn();

        // Subscribe
        adapter.on('error', handler);

        // Unsubscribe using off
        adapter.off('error', handler);

        // Emit event - handler should not be called
        adapter['eventEmitter'].emit('error', {
          error: {
            code: 'TEST_ERROR',
            message: 'Test error',
            category: 'general',
            fatal: false,
          } as ModalError,
          operation: 'test',
        });

        expect(handler).not.toHaveBeenCalled();
      });

      it('should handle multiple event handlers', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        adapter.on('state:changed', handler1);
        adapter.on('state:changed', handler2);

        // Emit event
        adapter['eventEmitter'].emit('state:changed', {
          state: adapter.state,
        });

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
      });

      it('should handle different event types', () => {
        const establishedHandler = vi.fn();
        const lostHandler = vi.fn();
        const errorHandler = vi.fn();

        adapter.on('connection:established', establishedHandler);
        adapter.on('connection:lost', lostHandler);
        adapter.on('error', errorHandler);

        // Emit different events
        adapter['eventEmitter'].emit('connection:established', {
          connection: {} as WalletConnection,
        });
        adapter['eventEmitter'].emit('connection:lost', { reason: 'test' });
        adapter['eventEmitter'].emit('error', {
          error: {} as ModalError,
          operation: 'test',
        });

        expect(establishedHandler).toHaveBeenCalledTimes(1);
        expect(lostHandler).toHaveBeenCalledTimes(1);
        expect(errorHandler).toHaveBeenCalledTimes(1);
      });
    }); // End of Event handling
  }); // End of Event Management

  describe('Connection Lifecycle', () => {
    describe('Abstract method implementation', () => {
      it('should install adapter with context', async () => {
        const context: AdapterContext = {
          logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
          },
          appMetadata: {
            name: 'Test App',
            url: 'https://test.com',
          },
        };

        await adapter.install(context);

        // Should set logger
        expect(adapter['logger']).toBe(context.logger);
      });

      it('should uninstall and cleanup', async () => {
        // First connect to create some state
        await adapter.connect();
        expect(adapter.state.status).toBe('connected');

        // Now uninstall
        await adapter.uninstall();

        // Should reset state
        expect(adapter.state.status).toBe('disconnected');
        expect(adapter.connection).toBeNull();
      });

      it('should connect and update state', async () => {
        const connection = await adapter.connect();

        expect(connection).toMatchObject({
          address: '0x123',
          accounts: ['0x123'],
          chain: {
            chainId: '0x1',
            chainType: ChainType.Evm,
          },
          walletId: 'debug-wallet',
        });

        // Check state was updated
        expect(adapter.state.status).toBe('connected');
        expect(adapter.state.address).toBe('0x123');
        expect(adapter.connection).toBe(connection);
      });

      it('should disconnect and cleanup', async () => {
        // First connect
        await adapter.connect();
        expect(adapter.state.status).toBe('connected');

        // Now disconnect
        await adapter.disconnect();

        expect(adapter.state.status).toBe('disconnected');
        expect(adapter.connection).toBeNull();
      });

      it('should throw error when getting provider without connection', () => {
        expect(() => adapter.getProvider(ChainType.Evm)).toThrow();
      });

      it('should return false for hasProvider without connection', () => {
        expect(adapter.hasProvider(ChainType.Evm)).toBe(false);
      });
    }); // End of Abstract method implementation

    describe('getJSONRPCTransport', () => {
      it('should return transport for supported chain type', () => {
        const transport = adapter.getJSONRPCTransport?.(ChainType.Evm);

        expect(transport).toBeDefined();
        expect(transport?.send).toBeTypeOf('function');
        expect(transport?.sendBatch).toBeTypeOf('function');
        expect(transport?.close).toBeTypeOf('function');
      });

      it('should return undefined for unsupported chain type', () => {
        const transport = adapter.getJSONRPCTransport?.(ChainType.Solana);

        expect(transport).toBeUndefined();
      });

      it('should return undefined by default in base class', () => {
        // Create adapter that doesn't override getJSONRPCTransport
        class MinimalAdapter extends AbstractWalletAdapter {
          id = 'minimal';
          metadata = {} as WalletAdapterMetadata;
          capabilities = {} as WalletCapabilities;

          async connect(): Promise<WalletConnection> {
            throw new Error('Not implemented');
          }

          async disconnect(): Promise<void> {
            // No-op
          }
        }

        const minimalAdapter = new MinimalAdapter();
        const transport = minimalAdapter.getJSONRPCTransport?.(ChainType.Evm);

        expect(transport).toBeUndefined();
      });
    }); // End of getJSONRPCTransport
  }); // End of Connection Lifecycle

  describe('Infrastructure & Utilities', () => {
    describe('Custom adapter with supportedProviders', () => {
      it('should allow overriding supportedProviders', () => {
        class CustomAdapter extends DebugWalletAdapter {
          readonly supportedProviders = {
            [ChainType.Evm]: 'EVMProvider' as unknown,
            [ChainType.Solana]: 'SolanaProvider' as unknown,
          };
        }

        const customAdapter = new CustomAdapter();

        expect(customAdapter.supportedProviders).toEqual({
          [ChainType.Evm]: 'EVMProvider',
          [ChainType.Solana]: 'SolanaProvider',
        });
      });
    }); // End of Custom adapter with supportedProviders

    describe('Infrastructure helpers', () => {
      it('should emit blockchain events using helper', () => {
        const handler = vi.fn();
        adapter.on('wallet:accountsChanged', handler);

        // Use test helper to emit blockchain event
        adapter.testEmitBlockchainEvent('accountsChanged', {
          accounts: ['0x456', '0x789'],
        });

        expect(handler).toHaveBeenCalledWith({
          accounts: ['0x456', '0x789'],
        });
      });

      it('should emit chain changed events', () => {
        const handler = vi.fn();
        adapter.on('wallet:chainChanged', handler);

        adapter.testEmitBlockchainEvent('chainChanged', {
          chainId: '0x89',
        });

        expect(handler).toHaveBeenCalledWith({
          chainId: '0x89',
        });
      });

      it('should emit disconnected events', () => {
        const handler = vi.fn();
        adapter.on('wallet:disconnected', handler);

        adapter.testEmitBlockchainEvent('disconnected', {
          reason: 'User rejected',
        });

        expect(handler).toHaveBeenCalledWith({
          reason: 'User rejected',
        });
      });

      it('should handle account change events', () => {
        const handler = vi.fn();
        adapter.on('accounts:changed', handler);

        adapter['eventEmitter'].emit('accounts:changed', {
          accounts: ['0x123', '0x456'],
          chainType: ChainType.Evm,
        });

        expect(handler).toHaveBeenCalledWith({
          accounts: ['0x123', '0x456'],
          chainType: ChainType.Evm,
        });
      });

      it('should handle chain change events', () => {
        const handler = vi.fn();
        adapter.on('chain:changed', handler);

        adapter['eventEmitter'].emit('chain:changed', {
          chainId: '0x89',
          chainType: ChainType.Evm,
        });

        expect(handler).toHaveBeenCalledWith({
          chainId: '0x89',
          chainType: ChainType.Evm,
        });
      });
    }); // End of Infrastructure helpers

    describe('Type safety', () => {
      it('should enforce correct event handler types', () => {
        // This test verifies TypeScript compilation more than runtime behavior
        const establishedHandler: EventHandler<'connection:established'> = (data) => {
          // TypeScript should know data has connection
          expect(data.connection).toBeDefined();
        };

        const lostHandler: EventHandler<'connection:lost'> = (data) => {
          // TypeScript should know data has reason
          expect(data.reason).toBeTypeOf('string');
        };

        const errorHandler: EventHandler<'error'> = (data) => {
          // Error should have error and operation
          expect(data.error).toBeDefined();
          expect(data.operation).toBeTypeOf('string');
        };

        adapter.on('connection:established', establishedHandler);
        adapter.on('connection:lost', lostHandler);
        adapter.on('error', errorHandler);

        // Cleanup
        adapter.off('connection:established', establishedHandler);
        adapter.off('connection:lost', lostHandler);
        adapter.off('error', errorHandler);
      });
    }); // End of Type safety

    describe('Infrastructure helper methods', () => {
      it('should create connection with helper method', async () => {
        const mockProvider = {} as WalletProvider;
        const connection = await adapter.testCreateConnection({
          address: '0x789',
          accounts: ['0x789', '0xabc'],
          chainId: '0x89',
          chainType: ChainType.Evm,
          provider: mockProvider,
          providerType: 'eip1193',
          features: ['sign_message'],
        });

        expect(connection).toMatchObject({
          address: '0x789',
          accounts: ['0x789', '0xabc'],
          chain: {
            chainId: '0x89',
            chainType: ChainType.Evm,
          },
          walletId: 'debug-wallet',
        });

        // Should update state
        expect(adapter.state.status).toBe('connected');
        expect(adapter.state.address).toBe('0x789');
        expect(adapter.connection).toBe(connection);
      });

      it('should emit events when creating connection', async () => {
        const establishedHandler = vi.fn();
        const connectedHandler = vi.fn();

        adapter.on('connection:established', establishedHandler);
        adapter.on('wallet:connected', connectedHandler);

        const mockProvider = {} as WalletProvider;
        await adapter.testCreateConnection({
          address: '0x999',
          accounts: ['0x999'],
          chainId: '0x1',
          chainType: ChainType.Evm,
          provider: mockProvider,
        });

        expect(establishedHandler).toHaveBeenCalledWith({
          connection: expect.objectContaining({
            address: '0x999',
            walletId: 'debug-wallet',
          }),
        });

        expect(connectedHandler).toHaveBeenCalledWith({
          connection: expect.objectContaining({
            address: '0x999',
            walletId: 'debug-wallet',
          }),
        });
      });
    }); // End of Infrastructure helper methods

    describe('Transport creation and management', () => {
      let createTransportMock: ReturnType<typeof vi.fn>;

      beforeEach(async () => {
        vi.clearAllMocks();
        const { createTransport } = await import('../../../api/transports/transports.js');
        createTransportMock = createTransport as ReturnType<typeof vi.fn>;
      });

      it('should create transport with proper configuration', async () => {
        const mockTransport = createMockTransport();

        createTransportMock.mockResolvedValue(mockTransport);

        const transport = await adapter.testCreateTransport(TransportType.Popup, {
          url: 'https://example.com',
        });

        expect(transport).toBe(mockTransport);
        expect(createTransportMock).toHaveBeenCalledWith(TransportType.Popup, {
          url: 'https://example.com',
        });
        // Should set up error handler
        expect(mockTransport.on).toHaveBeenCalledWith('error', expect.any(Function));
      });

      it('should handle transport creation errors', async () => {
        createTransportMock.mockRejectedValue(new Error('Transport creation failed'));

        await expect(adapter.testCreateTransport(TransportType.Popup, {})).rejects.toThrow(
          'Failed to create transport',
        );
      });

      it('should clean up existing transport before creating new one', async () => {
        const oldTransport = createMockTransport();
        const newTransport = createMockTransport();

        createTransportMock.mockResolvedValueOnce(oldTransport).mockResolvedValueOnce(newTransport);

        // Create first transport
        await adapter.testCreateTransport(TransportType.Popup, {});

        // Create second transport - should clean up first
        await adapter.testCreateTransport(TransportType.Extension, {});

        expect(oldTransport.disconnect).toHaveBeenCalled();
        expect(createTransportMock).toHaveBeenCalledTimes(2);
      });

      it('should handle transport error events', async () => {
        const mockTransport = createMockTransport();

        const errorHandler = vi.fn();
        adapter.on('error', errorHandler);

        createTransportMock.mockResolvedValue(mockTransport);

        await adapter.testCreateTransport(TransportType.Popup, {});

        // Get the error handler that was registered
        const transportErrorHandler = mockTransport.on.mock.calls[0][1];

        // Simulate transport error
        transportErrorHandler(new Error('Transport failed'));

        expect(errorHandler).toHaveBeenCalledWith({
          error: expect.objectContaining({
            code: 'transport_unavailable',
            message: 'Transport failed',
            category: 'network',
          }),
          operation: 'transport',
        });
      });

      it('should handle non-event emitter transports', async () => {
        const mockTransport = {
          // No 'on' method
          disconnect: vi.fn().mockResolvedValue(undefined),
        } as Partial<Transport> as Transport;

        createTransportMock.mockResolvedValue(mockTransport);

        const transport = await adapter.testCreateTransport(TransportType.Popup, {});

        expect(transport).toBe(mockTransport);
        // Should not throw even though transport doesn't have 'on' method
      });

      it('should handle non-Error objects in transport error event', async () => {
        const mockTransport = createMockTransport();

        const errorHandler = vi.fn();
        adapter.on('error', errorHandler);

        createTransportMock.mockResolvedValue(mockTransport);

        await adapter.testCreateTransport(TransportType.Popup, {});

        // Get the error handler that was registered
        const transportErrorHandler = mockTransport.on.mock.calls[0][1];

        // Simulate transport error with non-Error object
        transportErrorHandler({ message: 'Custom error object' });

        expect(errorHandler).toHaveBeenCalledWith({
          error: expect.objectContaining({
            code: 'transport_unavailable',
            message: 'Transport error',
            category: 'network',
          }),
          operation: 'transport',
        });
      });
    }); // End of Transport creation and management

    describe('Provider creation and management', () => {
      it('should create provider with transport', async () => {
        const mockTransport = createMockJSONRPCTransport();

        const MockProvider = vi.fn().mockImplementation(() => ({
          disconnect: vi.fn(),
        }));

        const provider = await adapter.testCreateProvider(
          MockProvider as ProviderClass,
          mockTransport,
          ChainType.Evm,
        );

        expect(MockProvider).toHaveBeenCalledWith(
          ChainType.Evm,
          mockTransport,
          undefined,
          expect.any(Object), // logger
        );
        expect(provider).toBeDefined();
      });

      it('should handle provider creation errors', async () => {
        const mockTransport = createMockJSONRPCTransport();
        const FailingProvider = vi.fn().mockImplementation(() => {
          throw new Error('Provider initialization failed');
        });

        await expect(
          adapter.testCreateProvider(FailingProvider as ProviderClass, mockTransport, ChainType.Evm),
        ).rejects.toThrow('Failed to create provider');
      });

      it('should set up provider listeners if setupProviderListeners is defined', async () => {
        // Create adapter with setupProviderListeners
        class AdapterWithListeners extends DebugWalletAdapter {
          setupProviderListenersCalled = false;

          protected setupProviderListeners(provider: WalletProvider): void {
            this.setupProviderListenersCalled = true;
          }
        }

        const adapterWithListeners = new AdapterWithListeners();
        const mockTransport = {
          request: vi.fn(),
        } as Partial<JSONRPCTransport> as JSONRPCTransport;

        const MockProvider = vi.fn().mockImplementation(() => ({
          disconnect: vi.fn(),
        }));

        await adapterWithListeners.testCreateProvider(
          MockProvider as ProviderClass,
          mockTransport,
          ChainType.Evm,
        );

        expect(adapterWithListeners.setupProviderListenersCalled).toBe(true);
      });

      it('should handle non-JSONRPC transports by throwing error', async () => {
        const mockTransport = {
          // Transport without 'request' method
          send: vi.fn(),
          disconnect: vi.fn(),
        } as Partial<Transport> as Transport;

        const MockProvider = vi.fn().mockImplementation(() => ({
          disconnect: vi.fn(),
        }));

        // TransportToJsonrpcAdapter was removed, so this should throw an error
        await expect(
          adapter.testCreateProvider(MockProvider as ProviderClass, mockTransport, ChainType.Evm, '0x1'),
        ).rejects.toThrow('Failed to create provider');
      });

      it('should store provider in providers map', async () => {
        const mockTransport = {
          request: vi.fn(),
        } as Partial<JSONRPCTransport> as JSONRPCTransport;

        const MockProvider = vi.fn().mockImplementation(() => ({
          disconnect: vi.fn(),
        }));

        await adapter.testCreateProvider(MockProvider as ProviderClass, mockTransport, ChainType.Solana);

        expect(adapter.hasProvider(ChainType.Solana)).toBe(true);
        expect(adapter.getProvider(ChainType.Solana)).toBeDefined();
      });
    }); // End of Provider creation and management
  }); // End of Infrastructure & Utilities

  describe('Error Handling & Edge Cases', () => {
    describe('Error handling and cleanup', () => {
      it('should handle errors during cleanup', async () => {
        // Create adapter with failing transport
        const failingTransport = {
          disconnect: vi.fn().mockRejectedValue(new Error('Disconnect failed')),
        } as Partial<Transport> as Transport;

        // Set transport directly
        adapter['transport'] = failingTransport;

        // Add a provider that fails cleanup
        const failingProvider = {
          disconnect: vi.fn().mockRejectedValue(new Error('Provider disconnect failed')),
        } as Partial<WalletProvider> as WalletProvider;
        adapter['providers'].set(ChainType.Evm, failingProvider);

        // Cleanup should not throw but should log warnings
        await expect(adapter['cleanup']()).resolves.not.toThrow();

        // Check that cleanup was attempted
        expect(failingTransport.disconnect).toHaveBeenCalled();
        expect(failingProvider.disconnect).toHaveBeenCalled();
      });

      it('should handle transport with close method instead of disconnect', async () => {
        const transportWithClose = {
          close: vi.fn().mockResolvedValue(undefined),
        } as Partial<Transport> as Transport;

        adapter['transport'] = transportWithClose;

        await adapter['cleanupTransport']();

        expect(transportWithClose.close).toHaveBeenCalled();
        expect(adapter['transport']).toBeNull();
      });

      it('should handle provider with close method instead of disconnect', async () => {
        const providerWithClose = {
          close: vi.fn().mockResolvedValue(undefined),
        } as Partial<WalletProvider> as WalletProvider;

        adapter['providers'].set(ChainType.Solana, providerWithClose);

        await adapter['cleanupProviders']();

        expect(providerWithClose.close).toHaveBeenCalled();
        expect(adapter['providers'].size).toBe(0);
      });

      it('should log info messages when logger is available', () => {
        const mockLogger = {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        };

        adapter['logger'] = mockLogger;
        adapter['log']('info', 'Test info message', { data: 'test' });

        expect(mockLogger.info).toHaveBeenCalledWith('[debug-wallet] Test info message', { data: 'test' });
      });

      it('should not log when logger is not available', () => {
        adapter['logger'] = undefined;

        // Should not throw
        expect(() => {
          adapter['log']('debug', 'Test message');
        }).not.toThrow();
      });
    }); // End of Error handling and cleanup

    describe('Logger adapter creation', () => {
      it('should create default logger when no logger provided', () => {
        adapter['logger'] = undefined;
        const logger = adapter['createLoggerAdapter']();

        expect(logger).toBeDefined();
        expect(logger.debug).toBeDefined();
        expect(logger.info).toBeDefined();
        expect(logger.warn).toBeDefined();
        expect(logger.error).toBeDefined();
      });

      it('should return Logger instance directly if provided', async () => {
        const { Logger } = await import('../../core/logger/logger.js');
        const loggerInstance = new Logger(true, 'test');

        adapter['logger'] = loggerInstance;
        const result = adapter['createLoggerAdapter']();

        expect(result).toBe(loggerInstance);
      });

      it('should wrap AdapterContext logger', () => {
        const mockLogger = {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        };

        adapter['logger'] = mockLogger;
        const wrappedLogger = adapter['createLoggerAdapter']();

        // Test each method
        wrappedLogger.debug('debug message', { test: true });
        expect(mockLogger.debug).toHaveBeenCalledWith('debug message', { test: true });

        wrappedLogger.info('info message');
        expect(mockLogger.info).toHaveBeenCalledWith('info message');

        wrappedLogger.warn('warn message', 'extra');
        expect(mockLogger.warn).toHaveBeenCalledWith('warn message', 'extra');

        wrappedLogger.error('error message', new Error('test'));
        expect(mockLogger.error).toHaveBeenCalledWith('error message', new Error('test'));
      });
    }); // End of Logger adapter creation
  }); // End of Error Handling & Edge Cases
});
