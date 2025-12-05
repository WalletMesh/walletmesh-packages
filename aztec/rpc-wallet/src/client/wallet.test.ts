import { AztecAddress } from '@aztec/aztec.js/addresses';
import { Fr } from '@aztec/aztec.js/fields';
import { TxHash } from '@aztec/aztec.js/tx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AztecWalletRouterProvider } from './aztec-router-provider.js';
import { AztecWalletProvider } from './wallet.js';

describe('AztecWalletProvider', () => {
  let mockProvider: AztecWalletRouterProvider;
  let wallet: AztecWalletProvider;
  let mockCall: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockCall = vi.fn();
    mockProvider = {
      call: mockCall,
    } as unknown as AztecWalletRouterProvider;
    wallet = new AztecWalletProvider(mockProvider, 'aztec:testnet');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provider and chainId', () => {
      const newWallet = new AztecWalletProvider(mockProvider, 'aztec:mainnet');
      expect(newWallet).toBeInstanceOf(AztecWalletProvider);
    });
  });

  describe('getChainInfo', () => {
    it('should call provider with correct method and chainId', async () => {
      const mockResult = { chainId: 1, version: '1.0.0' };
      mockCall.mockResolvedValue(mockResult);

      const result = await wallet.getChainInfo();

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_getChainInfo',
        params: [],
      });
      expect(result).toBe(mockResult);
    });
  });

  describe('getTxReceipt', () => {
    it('should call provider with txHash parameter', async () => {
      // Use a simple mock txHash instead of random() which is slow
      const mockTxHash = TxHash.fromString(`0x${'2'.repeat(64)}`);
      const mockResult = { status: 'mined', blockNumber: 123 };
      mockCall.mockResolvedValue(mockResult);

      const result = await wallet.getTxReceipt(mockTxHash);

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_getTxReceipt',
        params: [mockTxHash],
      });
      expect(result).toBe(mockResult);
    });
  });

  describe('getAccounts', () => {
    it('should call provider with correct method', async () => {
      // Use a simple mock address instead of random() which is slow
      const mockAddress = AztecAddress.fromString(`0x${'3'.repeat(64)}`);
      const mockResult = [{ alias: 'account1', item: mockAddress }];
      mockCall.mockResolvedValue(mockResult);

      const result = await wallet.getAccounts();

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_getAccounts',
        params: [],
      });
      expect(result).toBe(mockResult);
    });
  });

  describe('registerSender', () => {
    it('should call provider with address parameter', async () => {
      // Use a simple mock address instead of random() which is slow
      const mockAddress = AztecAddress.fromString(`0x${'1'.repeat(64)}`);
      mockCall.mockResolvedValue(mockAddress);

      const result = await wallet.registerSender(mockAddress);

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_registerSender',
        params: [mockAddress, undefined],
      });
      expect(result).toBe(mockAddress);
    });

    it('should call provider with address and alias', async () => {
      // Use a simple mock address instead of random() which is slow
      const mockAddress = AztecAddress.fromString(`0x${'1'.repeat(64)}`);
      const alias = 'my-sender';
      mockCall.mockResolvedValue(mockAddress);

      const result = await wallet.registerSender(mockAddress, alias);

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_registerSender',
        params: [mockAddress, alias],
      });
      expect(result).toBe(mockAddress);
    });
  });

  describe('getContractMetadata', () => {
    it('should call provider with contract address', async () => {
      // Use a simple mock address instead of random() which is slow
      const mockAddress = AztecAddress.fromString(`0x${'4'.repeat(64)}`);
      const mockResult = { name: 'TestContract', version: '1.0.0' };
      mockCall.mockResolvedValue(mockResult);

      const result = await wallet.getContractMetadata(mockAddress);

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_getContractMetadata',
        params: [mockAddress],
      });
      expect(result).toBe(mockResult);
    });
  });

  describe('getContractClassMetadata', () => {
    it('should call provider with classId', async () => {
      // Use a simple mock Fr instead of random() which is slow
      const mockClassId = Fr.fromString(`0x${'5'.repeat(64)}`);
      const mockResult = { name: 'TestClass', version: '1.0.0' };
      mockCall.mockResolvedValue(mockResult);

      const result = await wallet.getContractClassMetadata(mockClassId);

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_getContractClassMetadata',
        params: [mockClassId, false],
      });
      expect(result).toBe(mockResult);
    });

    it('should call provider with classId and includeArtifact flag', async () => {
      // Use a simple mock Fr instead of random() which is slow
      const mockClassId = Fr.fromString(`0x${'6'.repeat(64)}`);
      const mockResult = { name: 'TestClass', version: '1.0.0', artifact: {} };
      mockCall.mockResolvedValue(mockResult);

      const result = await wallet.getContractClassMetadata(mockClassId, true);

      expect(mockCall).toHaveBeenCalledWith('aztec:testnet', {
        method: 'aztec_getContractClassMetadata',
        params: [mockClassId, true],
      });
      expect(result).toBe(mockResult);
    });
  });
});
