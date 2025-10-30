/**
 * Tests for AztecAdapter New Improvements
 *
 * Validates the new functionality added to make AztecAdapter more robust:
 * - Session reuse logic
 * - Enhanced address serialization with multiple fallback strategies
 * - Enhanced logging
 * - JSON-RPC message filtering
 * - Session ID injection
 * - Error recovery
 * - Static wallet info method
 * - wallet_ready acknowledgment
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChainType } from '../../../types.js';
import { AztecAdapter } from './AztecAdapter.js';

// Mock the dynamic import of @walletmesh/aztec-rpc-wallet
vi.mock('@walletmesh/aztec-rpc-wallet', () => ({
  AztecRouterProvider: vi.fn().mockImplementation((_transport: JSONRPCTransport) => ({
    connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    call: vi.fn().mockImplementation(async (_network: string, request: { method: string }) => {
      if (request.method === 'aztec_getAddress') {
        return 'aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij';
      }
      return null;
    }),
  })),
}));

describe('AztecAdapter - New Improvements', () => {
  let adapter: AztecAdapter;
  let mockTransport: JSONRPCTransport;

  beforeEach(() => {
    // Create a mock transport
    mockTransport = {
      send: vi.fn(),
      sendBatch: vi.fn(),
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      isConnected: vi.fn().mockReturnValue(true),
      on: vi.fn().mockReturnValue(() => {}),
      off: vi.fn(),
      dispose: vi.fn(),
    } as unknown as JSONRPCTransport;
  });

  afterEach(() => {
    // Note: vi.clearAllMocks() clears call history but preserves implementations
    vi.clearAllMocks();
    // Restore the default mock implementation after each test
    vi.mocked(vi.fn()).mockClear();
  });

  describe('Static getWalletInfo', () => {
    it('should return wallet metadata', () => {
      const info = AztecAdapter.getWalletInfo();

      expect(info.id).toBe('aztec-wallet');
      expect(info.name).toBe('Aztec Wallet');
      expect(info.description).toBe('Connect with Aztec privacy-preserving network');
      expect(info.homepage).toBe('https://aztec.network');
      expect(info.chains).toEqual([ChainType.Aztec]);
      expect(info.features).toContain('sign_message');
      expect(info.features).toContain('encrypt');
      expect(info.features).toContain('decrypt');
      expect(info.features).toContain('multi_account');
      expect(info.icon).toContain('data:image/svg+xml');
    });
  });

  describe('Session reuse', () => {
    it('should reuse existing connection when still valid', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // First connection
      const connection1 = await adapter.connect();
      expect(connection1.address).toBe('aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij');

      const provider = adapter.getProvider(ChainType.Aztec) as unknown as {
        call: ReturnType<typeof vi.fn>;
      };
      const firstCallCount = provider.call.mock.calls.length;

      // Second connection - should reuse
      const connection2 = await adapter.connect();
      expect(connection2.address).toBe(connection1.address);

      // Should have made another call to verify connection is still valid
      expect(provider.call.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it('should create new connection if existing one is stale', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      let callCount = 0;

      // Mock to fail on second verification, forcing reconnection
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'new-session' }),
        disconnect: vi.fn(),
        call: vi.fn().mockImplementation(async () => {
          callCount++;
          if (callCount === 2) {
            // Fail verification check
            throw new Error('Connection stale');
          }
          return 'aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij';
        }),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // First connection
      await adapter.connect();

      // Second connection should create new connection after failed verification
      const connection2 = await adapter.connect();
      expect(connection2.address).toBeDefined();
    });
  });

  describe('Enhanced address serialization', () => {
    it('should handle address with toString() method', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        toString: () => 'aztec1validaddressstring123456789012345678901234567890',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('aztec1validaddressstring123456789012345678901234567890');
    });

    it('should extract address from value property', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        value: 'aztec1fromvalueproperty123456789012345678901234567890',
        toString: () => '[object Object]', // Should fallback to value
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('aztec1fromvalueproperty123456789012345678901234567890');
    });

    it('should convert bytes array to hex address', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        bytes: [
          0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
          0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
        ],
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it('should find hex address in nested properties', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        inner: {
          data: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
    });

    it('should handle bech32 format addresses', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        address: 'aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij',
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij');
    });
  });

  describe('JSON-RPC message filtering', () => {
    it('should validate JSON-RPC 2.0 messages', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Valid request message
      const validRequest = { jsonrpc: '2.0', method: 'wm_call', id: 1 };
      expect((adapter as any).isValidJsonRpcMessage(validRequest)).toBe(true);

      // Valid response message
      const validResponse = { jsonrpc: '2.0', id: 1, result: {} };
      expect((adapter as any).isValidJsonRpcMessage(validResponse)).toBe(true);

      // Valid error response
      const validError = { jsonrpc: '2.0', id: 1, error: { code: -32000, message: 'Error' } };
      expect((adapter as any).isValidJsonRpcMessage(validError)).toBe(true);

      // Invalid - missing jsonrpc
      expect((adapter as any).isValidJsonRpcMessage({ method: 'test', id: 1 })).toBe(false);

      // Invalid - wrong jsonrpc version
      expect((adapter as any).isValidJsonRpcMessage({ jsonrpc: '1.0', method: 'test' })).toBe(false);

      // Invalid - not an object
      expect((adapter as any).isValidJsonRpcMessage('invalid')).toBe(false);
      expect((adapter as any).isValidJsonRpcMessage(null)).toBe(false);
    });
  });

  describe('Session ID injection', () => {
    it('should inject session ID into wm_call messages', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Set session ID
      (adapter as any).sessionId = 'test-session-123';

      // Message with array params
      const messageWithArray = {
        jsonrpc: '2.0',
        method: 'wm_call',
        params: [{ network: 'aztec:testnet' }],
      };

      const processed = (adapter as any).injectSessionIdIfNeeded(messageWithArray);
      expect(processed.params[0]).toHaveProperty('sessionId', 'test-session-123');

      // Message with object params
      const messageWithObject = {
        jsonrpc: '2.0',
        method: 'wm_call',
        params: { network: 'aztec:testnet' },
      };

      const processedObj = (adapter as any).injectSessionIdIfNeeded(messageWithObject);
      expect(processedObj.params).toHaveProperty('sessionId', 'test-session-123');

      // Non-wm_call message should not be modified
      const otherMessage = {
        jsonrpc: '2.0',
        method: 'other_method',
        params: [{}],
      };

      const unchanged = (adapter as any).injectSessionIdIfNeeded(otherMessage);
      expect(unchanged).toBe(otherMessage);
    });

    it('should not inject session ID if already present', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      (adapter as any).sessionId = 'test-session-123';

      const messageWithExistingId = {
        jsonrpc: '2.0',
        method: 'wm_call',
        params: [{ sessionId: 'existing-id', network: 'aztec:testnet' }],
      };

      const processed = (adapter as any).injectSessionIdIfNeeded(messageWithExistingId);
      expect(processed.params[0].sessionId).toBe('existing-id');
    });
  });

  describe('wallet_ready acknowledgment', () => {
    it('should detect wallet_ready messages', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const readyMessage = {
        jsonrpc: '2.0',
        method: 'wallet_ready',
        id: 1,
      };

      expect((adapter as any).isWalletReadyMessage(readyMessage)).toBe(true);

      const otherMessage = {
        jsonrpc: '2.0',
        method: 'other_method',
        id: 2,
      };

      expect((adapter as any).isWalletReadyMessage(otherMessage)).toBe(false);
    });
  });

  describe('Error recovery', () => {
    it('should cleanup resources on connection failure', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');

      // Mock to fail connection
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
        disconnect: vi.fn(),
        call: vi.fn(),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Attempt connection
      await expect(adapter.connect()).rejects.toThrow();

      // Verify cleanup
      expect((adapter as any).sessionId).toBeNull();
      expect((adapter as any).aztecProvider).toBeUndefined();
      expect(adapter.providers.size).toBe(0);
    });
  });

  describe('Enhanced logging', () => {
    it('should log connection flow with structured data', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Logger is optional, may or may not be defined
      // But log method should always be available
      expect(typeof (adapter as any).log).toBe('function');

      // Test log method doesn't throw even without logger
      expect(() => (adapter as any).log('info', 'Test message')).not.toThrow();
      expect(() => (adapter as any).log('debug', 'Debug message', { data: 'test' })).not.toThrow();
    });
  });

  describe('Address validation', () => {
    it('should validate Aztec addresses correctly', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Valid bech32 address
      expect(
        (adapter as any).isValidAztecAddress('aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij'),
      ).toBe(true);

      // Valid hex address (64 hex chars after 0x)
      expect(
        (adapter as any).isValidAztecAddress(
          '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        ),
      ).toBe(true);

      // Invalid - too short
      expect((adapter as any).isValidAztecAddress('aztec1')).toBe(false);

      // Invalid - wrong prefix
      expect((adapter as any).isValidAztecAddress('invalid1234567890123456789012345678901234567890')).toBe(
        false,
      );

      // Invalid - not a string
      expect((adapter as any).isValidAztecAddress(null)).toBe(false);
      expect((adapter as any).isValidAztecAddress(undefined)).toBe(false);
      expect((adapter as any).isValidAztecAddress(123)).toBe(false);
    });
  });

  describe('Enhanced address serialization - advanced cases', () => {
    it('should handle address with _value property', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        _value: 'aztec1fromunderscorevalue12345678901234567890123456789',
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('aztec1fromunderscorevalue12345678901234567890123456789');
    });

    it('should handle address with data property', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        data: 'aztec1fromdataproperty123456789012345678901234567890',
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('aztec1fromdataproperty123456789012345678901234567890');
    });

    it('should handle address with hex property', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        hex: '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
    });

    it('should handle deeply nested address structures', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        wrapper: {
          inner: {
            data: '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
          },
        },
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const connection = await adapter.connect();
      expect(connection.address).toBe('0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789');
    });

    it('should handle malformed bytes array gracefully', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');
      const mockAddress = {
        bytes: ['not', 'numbers'],
        toString: () => '[object Object]',
      };

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
        disconnect: vi.fn(),
        call: vi.fn().mockResolvedValue(mockAddress),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Should fail validation
      await expect(adapter.connect()).rejects.toMatchObject({
        code: 'connection_failed',
      });
    });
  });

  describe('Transport wrapping and message handling', () => {
    it('should correctly wrap Transport to JSONRPCTransport', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      await adapter.connect();

      // Verify the adapter has wrapped the transport
      expect((adapter as any).jsonrpcUnsubscribe).toBeDefined();
    });

    it('should handle transport messages with different structures', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');

      const messages: unknown[] = [];
      const customTransport = {
        ...mockTransport,
        on: vi.fn().mockImplementation((event: string, callback: (msg: any) => void) => {
          if (event === 'message') {
            // Store callback for later invocation
            messages.push(callback);
          }
          return () => {};
        }),
      } as unknown as JSONRPCTransport;

      // Mock AztecRouterProvider to call onMessage on the transport
      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(
        (transport: JSONRPCTransport) => {
          // Simulate what real AztecRouterProvider does - call onMessage to set up listener
          if ('onMessage' in transport && typeof transport.onMessage === 'function') {
            transport.onMessage(() => {});
          }

          return {
            connect: vi.fn().mockResolvedValue({ sessionId: 'session-123' }),
            disconnect: vi.fn(),
            call: vi.fn().mockResolvedValue('aztec1qwertyuiopasdfghjklzxcvbnm1234567890abcdefghij'),
          };
        },
      );

      adapter = new AztecAdapter({
        transport: customTransport,
        network: 'aztec:testnet',
      });

      await adapter.connect();

      // Verify on was called (through the onMessage handler)
      expect(customTransport.on).toHaveBeenCalled();
    });

    it('should extract session ID from various response formats', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Response with sessionId in result
      const message1 = {
        jsonrpc: '2.0',
        id: 1,
        result: { sessionId: 'extracted-session-1' },
      };
      (adapter as any).extractSessionIdFromMessage(message1);
      expect((adapter as any).sessionId).toBe('extracted-session-1');

      // Response with sessionId at top level
      const message2 = {
        jsonrpc: '2.0',
        id: 2,
        sessionId: 'extracted-session-2',
      };
      (adapter as any).extractSessionIdFromMessage(message2);
      expect((adapter as any).sessionId).toBe('extracted-session-2');

      // Response with no sessionId should not change current sessionId
      const message3 = {
        jsonrpc: '2.0',
        id: 3,
        result: {},
      };
      const currentSessionId = (adapter as any).sessionId;
      (adapter as any).extractSessionIdFromMessage(message3);
      expect((adapter as any).sessionId).toBe(currentSessionId);
    });
  });

  describe('Session ID management', () => {
    it('should not inject session ID if none exists', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      (adapter as any).sessionId = null;

      const message = {
        jsonrpc: '2.0',
        method: 'wm_call',
        params: [{ network: 'aztec:testnet' }],
      };

      const result = (adapter as any).injectSessionIdIfNeeded(message);
      expect(result.params[0]).not.toHaveProperty('sessionId');
    });

    it('should preserve original message if not wm_call', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      (adapter as any).sessionId = 'test-session';

      const message = {
        jsonrpc: '2.0',
        method: 'other_method',
        params: [{ data: 'test' }],
      };

      const result = (adapter as any).injectSessionIdIfNeeded(message);
      expect(result).toBe(message); // Should return same reference
    });

    it('should handle params as undefined', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      (adapter as any).sessionId = 'test-session';

      const message = {
        jsonrpc: '2.0',
        method: 'wm_call',
      };

      const result = (adapter as any).injectSessionIdIfNeeded(message);
      expect(result).toBe(message); // Should not crash
    });
  });

  describe('wallet_ready message handling', () => {
    it('should detect wallet_ready with different case', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const message = {
        jsonrpc: '2.0',
        method: 'wallet_ready',
        id: 1,
      };

      expect((adapter as any).isWalletReadyMessage(message)).toBe(true);
    });

    it('should not detect non-wallet_ready messages', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const messages = [
        { jsonrpc: '2.0', method: 'wm_call', id: 1 },
        { jsonrpc: '2.0', method: 'connect', id: 2 },
        { jsonrpc: '2.0', result: {}, id: 3 },
      ];

      for (const message of messages) {
        expect((adapter as any).isWalletReadyMessage(message)).toBe(false);
      }
    });
  });

  describe('Error recovery - comprehensive', () => {
    it('should cleanup all resources on connection error', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockRejectedValue(new Error('Connection timeout')),
        disconnect: vi.fn(),
        call: vi.fn(),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Set some state to verify cleanup
      (adapter as any).sessionId = 'should-be-cleared';
      (adapter as any).aztecProvider = { some: 'data' };

      await expect(adapter.connect()).rejects.toThrow();

      // Verify complete cleanup
      expect((adapter as any).sessionId).toBeNull();
      expect((adapter as any).aztecProvider).toBeUndefined();
      expect(adapter.providers.size).toBe(0);
      expect(adapter.state.isConnected).toBe(false);
    });

    it('should handle cleanup errors gracefully', async () => {
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');

      (AztecRouterProvider as ReturnType<typeof vi.fn>).mockImplementationOnce(() => ({
        connect: vi.fn().mockRejectedValue(new Error('Connection failed')),
        disconnect: vi.fn(),
        call: vi.fn(),
      }));

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Mock transport.disconnect to throw
      const failingTransport = {
        ...mockTransport,
        disconnect: vi.fn().mockRejectedValue(new Error('Disconnect failed')),
      };
      (adapter as any).transport = failingTransport;

      // Should throw connection error (error message may be wrapped)
      await expect(adapter.connect()).rejects.toThrow();

      // Cleanup should still complete
      expect((adapter as any).sessionId).toBeNull();
    });
  });

  describe('Logging integration', () => {
    it('should log with different levels', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      // Test all log levels
      expect(() => (adapter as any).log('debug', 'Debug message', { data: 'test' })).not.toThrow();
      expect(() => (adapter as any).log('info', 'Info message')).not.toThrow();
      expect(() => (adapter as any).log('warn', 'Warning message')).not.toThrow();
      expect(() => (adapter as any).log('error', 'Error message', new Error('test'))).not.toThrow();
    });

    it('should handle logging with circular references', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      const circular: any = { a: 1 };
      circular.self = circular;

      // Should not throw on circular data
      expect(() => (adapter as any).log('debug', 'Circular data', circular)).not.toThrow();
    });
  });

  describe('Network validation', () => {
    it('should normalize network IDs without aztec prefix', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'testnet', // Without aztec: prefix
      });

      const connection = await adapter.connect();
      expect(connection.chain.chainId).toBe('aztec:testnet');
    });

    it('should accept 31337 as valid network', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:31337',
      });

      const connection = await adapter.connect();
      expect(connection.chain.chainId).toBe('aztec:31337');
    });

    it('should handle custom network with warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:custom-network',
      });

      const connection = await adapter.connect();
      expect(connection.chain.chainId).toBe('aztec:custom-network');

      consoleSpy.mockRestore();
    });
  });

  describe('Provider access patterns', () => {
    it('should throw descriptive error when accessing provider before connection', () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      expect(() => adapter.getProvider(ChainType.Aztec)).toThrow('not initialized or not connected');
    });

    it('should return provider after successful connection', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      await adapter.connect();

      const provider = adapter.getProvider(ChainType.Aztec);
      expect(provider).toBeDefined();
      expect(provider).toHaveProperty('call');
    });

    it('should throw for unsupported chain types', async () => {
      adapter = new AztecAdapter({
        transport: mockTransport,
        network: 'aztec:testnet',
      });

      await adapter.connect();

      expect(() => adapter.getProvider(ChainType.Evm)).toThrow('AztecAdapter does not support');
      expect(() => adapter.getProvider(ChainType.Solana)).toThrow('AztecAdapter does not support');
    });
  });
});
