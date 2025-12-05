import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AZTEC_WALLET_METHODS } from '../types.js';
import type { AztecWalletRouterProvider } from './aztec-router-provider.js';
import { connectAztec } from './helpers.js';
import { AztecWalletProvider } from './wallet.js';

// Mock the wallet module
vi.mock('./wallet.js', () => ({
  AztecWalletProvider: vi.fn(),
}));

describe('helpers', () => {
  let mockProvider: AztecWalletRouterProvider;
  let mockConnect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockConnect = vi.fn();
    mockProvider = {
      connect: mockConnect,
    } as unknown as AztecWalletRouterProvider;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('connectAztec', () => {
    it('should connect with default methods and create wallet', async () => {
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: {
          'aztec:testnet': {
            methods: AZTEC_WALLET_METHODS,
            metadata: {},
          },
        },
      };
      const mockWallet = {} as AztecWalletProvider;

      mockConnect.mockResolvedValue(mockConnectResult);
      vi.mocked(AztecWalletProvider).mockImplementation(() => mockWallet);

      const result = await connectAztec(mockProvider, 'aztec:testnet');

      expect(mockConnect).toHaveBeenCalledWith({
        'aztec:testnet': expect.arrayContaining([...AZTEC_WALLET_METHODS] as string[]),
      });
      expect(AztecWalletProvider).toHaveBeenCalledWith(mockProvider, 'aztec:testnet');
      expect(result).toEqual({
        sessionId: 'test-session',
        wallet: mockWallet,
      });
    });

    it('should connect with custom chainId', async () => {
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: {
          'aztec:mainnet': {
            methods: AZTEC_WALLET_METHODS,
            metadata: {},
          },
        },
      };
      const mockWallet = {} as AztecWalletProvider;

      mockConnect.mockResolvedValue(mockConnectResult);
      vi.mocked(AztecWalletProvider).mockImplementation(() => mockWallet);

      const result = await connectAztec(mockProvider, 'aztec:mainnet');

      expect(mockConnect).toHaveBeenCalledWith({
        'aztec:mainnet': expect.arrayContaining([...AZTEC_WALLET_METHODS] as string[]),
      });
      expect(AztecWalletProvider).toHaveBeenCalledWith(mockProvider, 'aztec:mainnet');
      expect(result.sessionId).toBe('test-session');
    });

    it('should connect with custom methods', async () => {
      const customMethods = ['aztec_getChainInfo', 'aztec_getAccounts'] as const;
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: {
          'aztec:testnet': {
            methods: customMethods,
            metadata: {},
          },
        },
      };
      const mockWallet = {} as AztecWalletProvider;

      mockConnect.mockResolvedValue(mockConnectResult);
      vi.mocked(AztecWalletProvider).mockImplementation(() => mockWallet);

      const result = await connectAztec(mockProvider, 'aztec:testnet', customMethods);

      expect(mockConnect).toHaveBeenCalledWith({
        'aztec:testnet': [...customMethods],
      });
      expect(AztecWalletProvider).toHaveBeenCalledWith(mockProvider, 'aztec:testnet');
      expect(result.sessionId).toBe('test-session');
    });

    it('should handle connection failure', async () => {
      const error = new Error('Connection failed');
      mockConnect.mockRejectedValue(error);

      await expect(connectAztec(mockProvider, 'aztec:testnet')).rejects.toThrow('Connection failed');
      expect(AztecWalletProvider).not.toHaveBeenCalled();
    });
  });
});
