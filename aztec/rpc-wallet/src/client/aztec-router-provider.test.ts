import { AztecAddress, CompleteAddress } from '@aztec/aztec.js';
// import { jsonStringify } from '@aztec/foundation/json-rpc'; // Unused
import type {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCTransport,
  // JSONRPCMethodMap, // Unused
} from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AztecWalletRouterProvider } from './aztec-router-provider.js';

// Define a minimal method map for testing purposes
// import type { JSONRPCParams } from '@walletmesh/jsonrpc'; // Unused

// This map is for conceptual organization in tests; actual type safety comes from provider.call
// interface TestAztecMethodMap { // Unused
//   aztec_getAddress: { result: AztecAddress; params?: undefined };
//   aztec_getCompleteAddress: { result: CompleteAddress; params?: undefined };
//   aztec_getBlockNumber: { result: number; params?: undefined };
//   some_unknown_method: { result: unknown; params?: Record<string, unknown> };
//   wm_call: { params: WmCallParams; result: unknown }; // This is the outer request
//   wm_connect: {
//     params?: { chainId?: string; options?: unknown };
//     result: { sessionId: string; permissions: unknown };
//   };
// }

// Define an interface for the structure of params for 'wm_call'
// Type aliases for simplified mock typing
// biome-ignore lint/suspicious/noExplicitAny: Test mock simplification
type JSONRPCRequestAny = JSONRPCRequest<any, any, any>;
// biome-ignore lint/suspicious/noExplicitAny: Test mock simplification
type JSONRPCResponseAny = JSONRPCResponse<any>;
interface WmCallParams {
  chainId: string;
  call: {
    method: string;
    params?: unknown;
  };
}
describe('AztecRouterProvider', () => {
  let mockTransport: JSONRPCTransport;
  let provider: AztecWalletRouterProvider;
  let sendMock: ReturnType<typeof vi.fn>;
  // biome-ignore lint/suspicious/noExplicitAny: Test mock simplification
  let messageHandler: (msg: JSONRPCResponse<any, any>) => void;
  // let requestIdCounter = 0; // Unused

  beforeEach(() => {
    // requestIdCounter = 0; // Unused
    sendMock = vi.fn();
    mockTransport = {
      send: sendMock,
      // biome-ignore lint/suspicious/noExplicitAny: Test mock simplification
      onMessage: (handler: (msg: JSONRPCResponse<any, any>) => void) => {
        messageHandler = handler;
        // Return a dummy cleanup function as expected by onMessage
        return () => {};
      },
    };
    provider = new AztecWalletRouterProvider(mockTransport);
  });

  describe('serialization', () => {
    it('should serialize AztecAddress results correctly', async () => {
      // Use a fixed test address string (AztecAddress format is 0x + 64 hex chars)
      const testAddressStr = `0x${'1'.repeat(64)}`;

      sendMock.mockImplementation(async (request: JSONRPCRequestAny) => {
        if (request.method === 'wm_call') {
          const resultPayload = {
            serialized: JSON.stringify(testAddressStr),
            method: 'aztec_getAddress',
          };
          const response: JSONRPCResponseAny = {
            jsonrpc: '2.0',
            id: request.id,
            result: resultPayload,
          };
          process.nextTick(() => {
            messageHandler(response);
          });
        }
      });

      provider['_sessionId'] = 'test-session';

      const result = await provider.call('aztec:mainnet', {
        method: 'aztec_getAddress',
      });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(AztecAddress);
      expect((result as AztecAddress).toString()).toBe(testAddressStr);
    });

    it('should serialize CompleteAddress results correctly', async () => {
      const testAddressStr =
        '0x' +
        '0637a51d0657242e85d8389b701d0b997a1e725beef42950eeb7b47ba900ceb2' +
        '12b2a7eb642de67d21bace929313fb39ee45ffe7f5c413fb605c4e1cc71ede46' +
        '270c635ac4debe508923847587d63f2004fdce3a0aadd4eb2fa32e756b3b7ceb' +
        '100faf645e19c147761f6f18ef79be235c9b57a0005b3ecdda388f26fc20682b' +
        '03f65a881a51f556be8f6d731d7d6f464c0a6cd04b6ce96ad03f968d9b254605' +
        '040de5aed50467bbb4cd92d22b9d9fb84563606620b4c98be389a558345eadd3' +
        '23db82d556864738e123fa48da67c8946bbea413b5d3b970c38ba908079812b3' +
        '2880ba2fb9aa6d14696cba7dc3d8d39d1502e1ca459b0639793364fe97286432' +
        '283df6e9a33d818fec833209ee18686cd306c49a7a479baefb725410bbaab16c' +
        '303c5120ccdd027bfc35a7e666e6940d49c0dfcf25e56e3420558e42b6a3dd91';

      sendMock.mockImplementation(async (request: JSONRPCRequestAny) => {
        if (request.method === 'wm_call') {
          const resultPayload = {
            serialized: JSON.stringify(testAddressStr),
            method: 'aztec_getCompleteAddress',
          };
          const response: JSONRPCResponseAny = {
            jsonrpc: '2.0',
            id: request.id,
            result: resultPayload,
          };
          process.nextTick(() => {
            messageHandler(response);
          });
        }
      });

      provider['_sessionId'] = 'test-session';

      const result = await provider.call('aztec:mainnet', {
        method: 'aztec_getCompleteAddress',
      });

      expect(result).toBeInstanceOf(CompleteAddress);
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('publicKeys');
      expect(result).toHaveProperty('partialAddress');
    });

    it('should pass through method calls without parameters', async () => {
      let capturedRequest: JSONRPCRequestAny | undefined;
      sendMock.mockImplementation(async (request: JSONRPCRequestAny) => {
        if (request.method === 'wm_call') {
          capturedRequest = request;
          const response: JSONRPCResponseAny = {
            jsonrpc: '2.0',
            id: request.id,
            result: 123,
          };
          process.nextTick(() => {
            messageHandler(response);
          });
        }
      });

      provider['_sessionId'] = 'test-session';

      await provider.call('aztec:mainnet', {
        method: 'aztec_getBlockNumber',
      });

      expect(capturedRequest).toBeDefined();
      if (capturedRequest) {
        expect(capturedRequest.method).toBe('wm_call');
        const params = capturedRequest.params as WmCallParams | undefined;
        expect(params).toBeDefined();

        if (params?.call) {
          expect(params.call.method).toBe('aztec_getBlockNumber');
          expect(params.call.params).toBeUndefined();
        } else if (params) {
          expect(params).toHaveProperty('call');
        }
      }
    });

    it('should handle methods without serializers', async () => {
      sendMock.mockImplementation(async (request: JSONRPCRequestAny) => {
        if (request.method === 'wm_call') {
          const resultPayload = { someData: 'test' };
          const response: JSONRPCResponseAny = {
            jsonrpc: '2.0',
            id: request.id,
            result: resultPayload,
          };
          process.nextTick(() => {
            messageHandler(response);
          });
        }
      });

      provider['_sessionId'] = 'test-session';

      const result = await provider.call('aztec:mainnet', {
        method: 'some_unknown_method' as string,
        params: { test: 'data' },
      });

      expect(result).toEqual({ someData: 'test' });
    });
  });

  describe('connection management', () => {
    it('should maintain session after connection', async () => {
      sendMock.mockImplementation(async (request: JSONRPCRequestAny) => {
        if (request.method === 'wm_connect') {
          const resultPayload = {
            sessionId: 'test-session-123',
            permissions: {
              'aztec:mainnet': {
                methods: ['aztec_getAddress'],
                metadata: {},
              },
            },
          };
          const response: JSONRPCResponseAny = {
            jsonrpc: '2.0',
            id: request.id,
            result: resultPayload,
          };
          process.nextTick(() => {
            messageHandler(response);
          });
        }
      });

      const result = await provider.connect({
        'aztec:mainnet': ['aztec_getAddress'],
      });

      expect(result.sessionId).toBe('test-session-123');
      expect(provider.sessionId).toBe('test-session-123');
    });
  });
});
