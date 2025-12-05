import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type AztecDappWallet, createAztecWallet } from './aztec-dapp-wallet.js';
import type { AztecWalletRouterProvider } from './aztec-router-provider.js';
import { connectAztec } from './helpers.js';
import { AZTEC_WALLET_METHODS } from '../types.js';

// Mock the aztec-dapp-wallet module
vi.mock('./aztec-dapp-wallet.js', () => ({
  createAztecWallet: vi.fn(),
}));

// Mock provider
const createMockProvider = () => {
  const connect = vi.fn();
  const on = vi.fn();
  const off = vi.fn();
  const call = vi.fn();
  const dispose = vi.fn();
  return {
    connect,
    on,
    off,
    call,
    dispose,
    // biome-ignore lint/suspicious/noExplicitAny: mock
  } as any as AztecWalletRouterProvider;
};

describe('helpers', () => {
  let provider: ReturnType<typeof createMockProvider>;

  beforeEach(() => {
    provider = createMockProvider();
    vi.clearAllMocks();
  });

  describe('constants', () => {
    it('should export ALL_AZTEC_METHODS with all available methods', () => {
      // Should include essential methods
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getAddress');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getCompleteAddress');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getChainId');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getVersion');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_sendTx');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getTxReceipt');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_simulateTx');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getNodeInfo');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getBlockNumber');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getCurrentBaseFees');
      // Should include additional methods
      expect(AZTEC_WALLET_METHODS).toContain('aztec_registerSender');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getSenders');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_removeSender');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_registerContract');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_registerContractClass');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getContractMetadata');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getContractClassMetadata');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_proveTx');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_profileTx');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_simulateUtility');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getPrivateEvents');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getPublicEvents');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getPXEInfo');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_getBlock');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_createAuthWit');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_wmDeployContract');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_wmExecuteTx');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_wmSimulateTx');
      expect(AZTEC_WALLET_METHODS).toContain('aztec_wmDeployContract');

      // Check total length
      expect(AZTEC_WALLET_METHODS).toHaveLength(28);
    });
  });

  describe('connectAztec', () => {
    it('should connect and create wallet with default chainId and methods', async () => {
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: { 'aztec:mainnet': {} }, // Mock HumanReadableChainPermissions
      };
      const mockWallet = { address: '0x123' } as unknown as AztecDappWallet;

      vi.mocked(provider.connect).mockResolvedValue(mockConnectResult);
      vi.mocked(createAztecWallet).mockResolvedValue(mockWallet);

      const result = await connectAztec(provider, 'aztec:mainnet');

      expect(provider.connect).toHaveBeenCalledWith({
        'aztec:mainnet': AZTEC_WALLET_METHODS,
      });
      expect(createAztecWallet).toHaveBeenCalledWith(provider, 'aztec:mainnet');
      expect(result).toEqual({
        sessionId: mockConnectResult.sessionId,
        wallet: mockWallet,
      });
    });

    it('should connect and create wallet with custom chainId', async () => {
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: { 'aztec:custom': {} },
      };
      const mockWallet = { address: '0x123' } as unknown as AztecDappWallet;
      const customChainId = 'aztec:custom';

      vi.mocked(provider.connect).mockResolvedValue(mockConnectResult);
      vi.mocked(createAztecWallet).mockResolvedValue(mockWallet);

      const result = await connectAztec(provider, customChainId);

      expect(provider.connect).toHaveBeenCalledWith({
        [customChainId]: AZTEC_WALLET_METHODS,
      });
      expect(createAztecWallet).toHaveBeenCalledWith(provider, customChainId);
      expect(result).toEqual({
        sessionId: mockConnectResult.sessionId,
        wallet: mockWallet,
      });
    });

    it('should connect and create wallet with custom methods', async () => {
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: { 'aztec:mainnet': {} },
      };
      const mockWallet = { address: '0x123' } as unknown as AztecDappWallet;
      const customMethods = ['aztec_getAddress', 'aztec_sendTx'];

      vi.mocked(provider.connect).mockResolvedValue(mockConnectResult);
      vi.mocked(createAztecWallet).mockResolvedValue(mockWallet);

      const result = await connectAztec(provider, 'aztec:mainnet', customMethods);

      expect(provider.connect).toHaveBeenCalledWith({
        'aztec:mainnet': customMethods,
      });
      expect(createAztecWallet).toHaveBeenCalledWith(provider, 'aztec:mainnet');
      expect(result).toEqual({
        sessionId: mockConnectResult.sessionId,
        wallet: mockWallet,
      });
    });

    it('should connect and create wallet with custom chainId and methods', async () => {
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: { 'aztec:testnet': {} },
      };
      const mockWallet = { address: '0x123' } as unknown as AztecDappWallet;
      const customChainId = 'aztec:testnet';
      const customMethods = ['aztec_getAddress'];

      vi.mocked(provider.connect).mockResolvedValue(mockConnectResult);
      vi.mocked(createAztecWallet).mockResolvedValue(mockWallet);

      const result = await connectAztec(provider, customChainId, customMethods);

      expect(provider.connect).toHaveBeenCalledWith({
        [customChainId]: customMethods,
      });
      expect(createAztecWallet).toHaveBeenCalledWith(provider, customChainId);
      expect(result).toEqual({
        sessionId: mockConnectResult.sessionId,
        wallet: mockWallet,
      });
    });

    it('should handle connection failure', async () => {
      const error = new Error('Connection failed');
      vi.mocked(provider.connect).mockRejectedValue(error);

      await expect(connectAztec(provider, 'aztec:mainnet')).rejects.toThrow('Connection failed');
      expect(createAztecWallet).not.toHaveBeenCalled();
    });

    it('should handle wallet creation failure', async () => {
      const mockConnectResult = {
        sessionId: 'test-session',
        permissions: { 'aztec:mainnet': {} },
      };
      const error = new Error('Wallet creation failed');

      vi.mocked(provider.connect).mockResolvedValue(mockConnectResult);
      vi.mocked(createAztecWallet).mockRejectedValue(error);

      await expect(connectAztec(provider, 'aztec:mainnet')).rejects.toThrow('Wallet creation failed');
    });
  });
});
