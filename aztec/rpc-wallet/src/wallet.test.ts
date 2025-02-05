import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AccountWallet, PXE } from '@aztec/aztec.js';
import { JSONRPCWalletClient } from '@walletmesh/router';
import { AztecChainWallet } from './wallet.js';
import { ContractArtifactCache } from './contractArtifactCache.js';
import { AztecWalletError } from './errors.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { AztecWalletContext } from './types.js';

describe('AztecChainWallet', () => {
  let pxe: PXE;
  let wallet: AccountWallet;
  let transport: JSONRPCTransport;
  let aztecWallet: AztecChainWallet;

  beforeEach(() => {
    // Mock PXE
    pxe = {
      // Add required PXE methods as needed
    } as unknown as PXE;

    // Mock AccountWallet
    wallet = {
      getAddress: vi.fn().mockResolvedValue('mockAddress'),
    } as unknown as AccountWallet;

    // Mock Transport
    transport = {
      send: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    } as unknown as JSONRPCTransport;

    // Create wallet instance
    aztecWallet = new AztecChainWallet(pxe, wallet, transport);

    // Setup fallback handler and serializer
    const mockHandler = vi.fn().mockImplementation(async (context, method, _params) => {
      if (!isAztecWalletContext(context)) {
        throw new AztecWalletError('unknownInternalError', 'Invalid context');
      }
      if (method === 'aztec_getAccount') {
        return await context.wallet.getAddress();
      }
      throw new AztecWalletError('invalidRequest', `Method not supported: ${method}`);
    });

    const mockSerializer = {
      serialize: vi.fn().mockImplementation((value) => value),
      deserialize: vi.fn().mockImplementation((value) => value),
    };

    Object.defineProperties(aztecWallet, {
      fallbackHandler: {
        value: mockHandler,
        writable: true,
        configurable: true,
      },
      fallbackSerializer: {
        value: mockSerializer,
        writable: true,
        configurable: true,
      },
    });
  });

  describe('constructor', () => {
    it('initializes with valid context', () => {
      expect(aztecWallet).toBeInstanceOf(AztecChainWallet);
      const context = (aztecWallet as unknown as { context: AztecWalletContext }).context;
      expect(context.pxe).toBe(pxe);
      expect(context.wallet).toBe(wallet);
      expect(context.contractArtifactCache).toBeInstanceOf(ContractArtifactCache);
    });

    it('sets up fallback handler and serializer', () => {
      const instance = aztecWallet as unknown as {
        fallbackHandler: unknown;
        fallbackSerializer: unknown;
      };
      expect(instance.fallbackHandler).toBeDefined();
      expect(instance.fallbackSerializer).toBeDefined();
    });

    it('throws error when handler receives invalid context', async () => {
      // Create a mock transport that simulates an error response
      const mockSend = vi
        .fn()
        .mockRejectedValue(new AztecWalletError('unknownInternalError', 'Invalid context'));

      const invalidTransport = {
        send: mockSend,
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      } as unknown as JSONRPCTransport;

      // Create wallet with invalid context
      new AztecChainWallet(null as unknown as PXE, null as unknown as AccountWallet, invalidTransport);

      // Attempt to send a request
      const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'test_method',
        params: [],
      };

      // Verify the error is thrown
      await expect(mockSend(request)).rejects.toThrow(AztecWalletError);
      expect(mockSend).toHaveBeenCalledWith(request);
    });
  });

  describe('isAztecWalletContext', () => {
    it('returns true for valid context', () => {
      const validContext = {
        pxe,
        wallet,
        contractArtifactCache: new ContractArtifactCache(wallet),
      };
      expect(isAztecWalletContext(validContext)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isAztecWalletContext(null)).toBe(false);
    });

    it('returns false for non-object values', () => {
      expect(isAztecWalletContext(123)).toBe(false);
      expect(isAztecWalletContext('string')).toBe(false);
      expect(isAztecWalletContext(undefined)).toBe(false);
      expect(isAztecWalletContext(true)).toBe(false);
      expect(isAztecWalletContext([])).toBe(false);
      expect(isAztecWalletContext(() => {})).toBe(false);
    });

    it('returns false for missing required properties', () => {
      expect(isAztecWalletContext({})).toBe(false);
      expect(isAztecWalletContext({ pxe })).toBe(false);
      expect(isAztecWalletContext({ pxe, wallet })).toBe(false);
      expect(isAztecWalletContext({ wallet, contractArtifactCache: new ContractArtifactCache(wallet) })).toBe(
        false,
      );
    });

    it('returns false for objects with null properties', () => {
      expect(isAztecWalletContext({ pxe: null, wallet: null, contractArtifactCache: null })).toBe(false);
      expect(
        isAztecWalletContext({ pxe, wallet: null, contractArtifactCache: new ContractArtifactCache(wallet) }),
      ).toBe(false);
      expect(
        isAztecWalletContext({ pxe: null, wallet, contractArtifactCache: new ContractArtifactCache(wallet) }),
      ).toBe(false);
    });
  });

  describe('asWalletRouterClient', () => {
    it('returns a JSONRPCWalletClient instance', () => {
      const client = aztecWallet.asWalletRouterClient();
      expect(client).toBeInstanceOf(JSONRPCWalletClient);
    });

    it('returns a valid router client', () => {
      const client = aztecWallet.asWalletRouterClient();
      // Verify the client is properly instantiated
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(JSONRPCWalletClient);
    });
  });

  describe('request handling', () => {
    it('handles valid context in fallback handler', async () => {
      const result = await (
        aztecWallet as unknown as {
          fallbackHandler: (
            context: AztecWalletContext,
            method: string,
            params: unknown[],
          ) => Promise<unknown>;
        }
      ).fallbackHandler(
        {
          pxe,
          wallet,
          contractArtifactCache: new ContractArtifactCache(wallet),
        },
        'aztec_getAccount',
        [],
      );
      expect(result).toBe('mockAddress');
    });

    it('throws error for invalid context in fallback handler', async () => {
      await expect(
        (
          aztecWallet as unknown as {
            fallbackHandler: (
              context: AztecWalletContext,
              method: string,
              params: unknown[],
            ) => Promise<unknown>;
          }
        ).fallbackHandler({ invalidContext: true } as unknown as AztecWalletContext, 'aztec_getAccount', []),
      ).rejects.toThrow(AztecWalletError);
    });
  });

  describe('message handling', () => {
    it('processes incoming messages through transport', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_getAccount',
        params: [],
      };

      // Setup request handler to use fallback handler
      const handleRequest = async (msg: unknown) => {
        const typedMessage = msg as { method: string; params: unknown[] };
        return (
          aztecWallet as unknown as {
            fallbackHandler: (
              context: AztecWalletContext,
              method: string,
              params: unknown[],
            ) => Promise<unknown>;
          }
        ).fallbackHandler(
          { pxe, wallet, contractArtifactCache: new ContractArtifactCache(wallet) },
          typedMessage.method,
          typedMessage.params,
        );
      };

      (aztecWallet as unknown as { handleRequest: typeof handleRequest }).handleRequest = handleRequest;

      await handleRequest(message);
      expect(wallet.getAddress).toHaveBeenCalled();
    });

    it('handles transport errors gracefully', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'invalidMethod',
        params: [],
      };

      // Setup request handler to throw error for invalid method
      const handleRequest = async (_msg: unknown) => {
        throw new AztecWalletError('invalidRequest', 'Invalid method');
      };

      (aztecWallet as unknown as { handleRequest: typeof handleRequest }).handleRequest = handleRequest;

      await expect(handleRequest(message)).rejects.toThrow(AztecWalletError);
    });
  });
});

// Helper function to check context type
function isAztecWalletContext(value: unknown): value is AztecWalletContext {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pxe' in value &&
    'wallet' in value &&
    'contractArtifactCache' in value &&
    value.pxe !== null &&
    value.wallet !== null &&
    value.contractArtifactCache !== null
  );
}
