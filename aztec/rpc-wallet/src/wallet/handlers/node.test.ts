import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNodeHandlers } from './node.js';
import type { AccountWallet, PXE } from '@aztec/aztec.js';
import type { NodeInfo } from '@aztec/stdlib/contract';
import type { GasFees } from '@aztec/stdlib/gas';
import type { PXEInfo } from '@aztec/stdlib/interfaces/client';
import type { L2Block } from '@aztec/aztec.js';
import type { AztecHandlerContext } from './index.js';
import type { ContractArtifactCache } from '../../contractArtifactCache.js';
import { Fr } from '@aztec/aztec.js';

// Mock dependencies
const createMockWallet = () =>
  ({
    getChainId: vi.fn(),
    getVersion: vi.fn(),
    getNodeInfo: vi.fn(),
    getCurrentBaseFees: vi.fn(),
  }) as unknown as AccountWallet;

const createMockPXE = () =>
  ({
    getPXEInfo: vi.fn(),
    getBlock: vi.fn(),
    getBlockNumber: vi.fn(),
  }) as unknown as PXE;

const createMockContext = (wallet: AccountWallet, pxe: PXE): AztecHandlerContext => ({
  wallet,
  pxe,
  cache: {} as ContractArtifactCache,
});

describe('Node Handlers', () => {
  let mockWallet: AccountWallet;
  let mockPXE: PXE;
  let context: AztecHandlerContext;
  let handlers: ReturnType<typeof createNodeHandlers>;

  beforeEach(() => {
    mockWallet = createMockWallet();
    mockPXE = createMockPXE();
    context = createMockContext(mockWallet, mockPXE);
    handlers = createNodeHandlers();
  });

  describe('wm_getSupportedMethods', () => {
    it('should return array of supported Aztec methods', async () => {
      const result = await handlers.wm_getSupportedMethods(context, []);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('aztec_getAddress');
      expect(result).toContain('aztec_getChainId');
      expect(result).toContain('aztec_sendTx');
      expect(result).toContain('wm_getSupportedMethods');
      expect(result.length).toBeGreaterThan(25); // Should have many methods
    });

    it('should include all essential wallet methods', async () => {
      const result = await handlers.wm_getSupportedMethods(context, []);

      const essentialMethods = [
        'aztec_getAddress',
        'aztec_getCompleteAddress',
        'aztec_createAuthWit',
        'aztec_sendTx',
        'aztec_getTxReceipt',
        'aztec_getNodeInfo',
        'aztec_getChainId',
        'aztec_getVersion',
      ];

      for (const method of essentialMethods) {
        expect(result).toContain(method);
      }
    });
  });

  describe('aztec_getChainId', () => {
    it('should call wallet.getChainId and return numeric value', async () => {
      const chainId = new Fr(31337);
      vi.mocked(mockWallet.getChainId).mockReturnValue(chainId);

      const result = await handlers.aztec_getChainId(context, []);

      expect(mockWallet.getChainId).toHaveBeenCalledOnce();
      expect(result.toNumber()).toBe(31337);
      expect(result).toBeInstanceOf(Fr);
    });

    it('should handle large chain IDs', async () => {
      const chainId = new Fr(123456789);
      vi.mocked(mockWallet.getChainId).mockReturnValue(chainId);

      const result = await handlers.aztec_getChainId(context, []);

      expect(mockWallet.getChainId).toHaveBeenCalledOnce();
      expect(result.toNumber()).toBe(123456789);
    });

    it('should propagate errors from wallet.getChainId', async () => {
      const error = new Error('Failed to get chain ID');
      vi.mocked(mockWallet.getChainId).mockImplementation(() => {
        throw error;
      });

      await expect(handlers.aztec_getChainId(context, [])).rejects.toThrow('Failed to get chain ID');
    });
  });

  describe('aztec_getVersion', () => {
    it('should call wallet.getVersion and return numeric value', async () => {
      const version = new Fr(1);
      vi.mocked(mockWallet.getVersion).mockReturnValue(version);

      const result = await handlers.aztec_getVersion(context, []);

      expect(mockWallet.getVersion).toHaveBeenCalledOnce();
      expect(result.toNumber()).toBe(1);
      expect(result).toBeInstanceOf(Fr);
    });

    it('should handle different version numbers', async () => {
      const version = new Fr(42);
      vi.mocked(mockWallet.getVersion).mockReturnValue(version);

      const result = await handlers.aztec_getVersion(context, []);

      expect(mockWallet.getVersion).toHaveBeenCalledOnce();
      expect(result.toNumber()).toBe(42);
    });

    it('should propagate errors from wallet.getVersion', async () => {
      const error = new Error('Failed to get version');
      vi.mocked(mockWallet.getVersion).mockImplementation(() => {
        throw error;
      });

      await expect(handlers.aztec_getVersion(context, [])).rejects.toThrow('Failed to get version');
    });
  });

  describe('aztec_getNodeInfo', () => {
    it('should call wallet.getNodeInfo and return node information', async () => {
      const nodeInfo = {
        nodeVersion: '0.1.0',
        l1ChainId: 1,
        protocolVersion: 1,
        l1ContractAddresses: {
          availabilityOracleAddress: '0x123' as unknown,
          rollupAddress: '0x456' as unknown,
          registryAddress: '0x789' as unknown,
          inboxAddress: '0xabc' as unknown,
          outboxAddress: '0xdef' as unknown,
          gasTokenAddress: '0x111' as unknown,
          gasPortalAddress: '0x222' as unknown,
        },
      } as unknown as NodeInfo;

      vi.mocked(mockWallet.getNodeInfo).mockResolvedValue(nodeInfo);

      const result = await handlers.aztec_getNodeInfo(context, []);

      expect(mockWallet.getNodeInfo).toHaveBeenCalledOnce();
      expect(result).toBe(nodeInfo);
      expect(result.nodeVersion).toBe('0.1.0');
      expect(result.l1ChainId).toBe(1);
    });

    it('should propagate errors from wallet.getNodeInfo', async () => {
      const error = new Error('Failed to get node info');
      vi.mocked(mockWallet.getNodeInfo).mockRejectedValue(error);

      await expect(handlers.aztec_getNodeInfo(context, [])).rejects.toThrow('Failed to get node info');
      expect(mockWallet.getNodeInfo).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_getCurrentBaseFees', () => {
    it('should call wallet.getCurrentBaseFees and return fee information', async () => {
      const gasFees = {
        feePerDaGas: 100n,
        feePerL2Gas: 200n,
      } as unknown as GasFees;

      vi.mocked(mockWallet.getCurrentBaseFees).mockResolvedValue(gasFees);

      const result = await handlers.aztec_getCurrentBaseFees(context, []);

      expect(mockWallet.getCurrentBaseFees).toHaveBeenCalledOnce();
      expect(result).toBe(gasFees);
    });

    it('should propagate errors from wallet.getCurrentBaseFees', async () => {
      const error = new Error('Failed to get base fees');
      vi.mocked(mockWallet.getCurrentBaseFees).mockRejectedValue(error);

      await expect(handlers.aztec_getCurrentBaseFees(context, [])).rejects.toThrow('Failed to get base fees');
      expect(mockWallet.getCurrentBaseFees).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_getPXEInfo', () => {
    it('should call pxe.getPXEInfo and return PXE information', async () => {
      const pxeInfo = {
        pxeVersion: '0.1.0',
        protocolVersion: 1,
        l1ContractAddresses: {
          availabilityOracleAddress: '0x123' as unknown,
          rollupAddress: '0x456' as unknown,
          registryAddress: '0x789' as unknown,
          inboxAddress: '0xabc' as unknown,
          outboxAddress: '0xdef' as unknown,
          gasTokenAddress: '0x111' as unknown,
          gasPortalAddress: '0x222' as unknown,
        },
      } as unknown as PXEInfo;

      vi.mocked(mockPXE.getPXEInfo).mockResolvedValue(pxeInfo);

      const result = await handlers.aztec_getPXEInfo(context, []);

      expect(mockPXE.getPXEInfo).toHaveBeenCalledOnce();
      expect(result).toBe(pxeInfo);
      expect(result.pxeVersion).toBe('0.1.0');
    });

    it('should propagate errors from pxe.getPXEInfo', async () => {
      const error = new Error('Failed to get PXE info');
      vi.mocked(mockPXE.getPXEInfo).mockRejectedValue(error);

      await expect(handlers.aztec_getPXEInfo(context, [])).rejects.toThrow('Failed to get PXE info');
      expect(mockPXE.getPXEInfo).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_getBlock', () => {
    it('should call pxe.getBlock with block number and return block', async () => {
      const blockNumber = 42;
      const block = {
        number: blockNumber,
        hash: '0xabcdef1234567890',
        timestamp: Date.now(),
        l1BlockNumber: 100,
      } as unknown as L2Block;

      vi.mocked(mockPXE.getBlock).mockResolvedValue(block);

      const result = await handlers.aztec_getBlock(context, [blockNumber]);

      expect(mockPXE.getBlock).toHaveBeenCalledWith(blockNumber);
      expect(result).toBe(block);
      expect(result.number).toBe(blockNumber);
    });

    it('should throw error when block is not found', async () => {
      const blockNumber = 999999;
      vi.mocked(mockPXE.getBlock).mockResolvedValue(undefined);

      await expect(handlers.aztec_getBlock(context, [blockNumber])).rejects.toThrow('Block not found');
      expect(mockPXE.getBlock).toHaveBeenCalledWith(blockNumber);
    });

    it('should propagate errors from pxe.getBlock', async () => {
      const blockNumber = 42;
      const error = new Error('Failed to get block');
      vi.mocked(mockPXE.getBlock).mockRejectedValue(error);

      await expect(handlers.aztec_getBlock(context, [blockNumber])).rejects.toThrow('Failed to get block');
      expect(mockPXE.getBlock).toHaveBeenCalledWith(blockNumber);
    });
  });

  describe('aztec_getBlockNumber', () => {
    it('should call pxe.getBlockNumber and return current block number', async () => {
      const blockNumber = 12345;
      vi.mocked(mockPXE.getBlockNumber).mockResolvedValue(blockNumber);

      const result = await handlers.aztec_getBlockNumber(context, []);

      expect(mockPXE.getBlockNumber).toHaveBeenCalledOnce();
      expect(result).toBe(blockNumber);
      expect(typeof result).toBe('number');
    });

    it('should handle block number of 0', async () => {
      const blockNumber = 0;
      vi.mocked(mockPXE.getBlockNumber).mockResolvedValue(blockNumber);

      const result = await handlers.aztec_getBlockNumber(context, []);

      expect(mockPXE.getBlockNumber).toHaveBeenCalledOnce();
      expect(result).toBe(0);
    });

    it('should propagate errors from pxe.getBlockNumber', async () => {
      const error = new Error('Failed to get block number');
      vi.mocked(mockPXE.getBlockNumber).mockRejectedValue(error);

      await expect(handlers.aztec_getBlockNumber(context, [])).rejects.toThrow('Failed to get block number');
      expect(mockPXE.getBlockNumber).toHaveBeenCalledOnce();
    });
  });
});
