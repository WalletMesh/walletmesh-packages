import type { AccountWallet, AztecAddress, PXE } from '@aztec/aztec.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContractArtifactCache } from '../../contractArtifactCache.js';
import type { AztecHandlerContext } from './index.js';
import { createSenderHandlers } from './senders.js';

// Mock dependencies
const createMockWallet = () =>
  ({
    registerSender: vi.fn(),
    getSenders: vi.fn(),
    removeSender: vi.fn(),
  }) as unknown as AccountWallet;

const createMockPXE = () =>
  ({
    // No specific methods needed for sender handlers
  }) as unknown as PXE;

const createMockContext = (wallet: AccountWallet, pxe: PXE): AztecHandlerContext => ({
  wallet,
  pxe,
  cache: {} as ContractArtifactCache,
});

describe('Sender Handlers', () => {
  let mockWallet: AccountWallet;
  let mockPXE: PXE;
  let context: AztecHandlerContext;
  let handlers: ReturnType<typeof createSenderHandlers>;

  beforeEach(() => {
    mockWallet = createMockWallet();
    mockPXE = createMockPXE();
    context = createMockContext(mockWallet, mockPXE);
    handlers = createSenderHandlers();
  });

  describe('aztec_registerSender', () => {
    it('should register a sender and return the sender address', async () => {
      const senderAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      vi.mocked(mockWallet.registerSender).mockResolvedValue(senderAddress);

      const result = await handlers.aztec_registerSender(context, [senderAddress]);

      expect(mockWallet.registerSender).toHaveBeenCalledWith(senderAddress);
      expect(result).toBe(senderAddress);
    });

    it('should handle different sender addresses', async () => {
      const senderAddress = '0xabcdef1234567890' as unknown as AztecAddress;
      vi.mocked(mockWallet.registerSender).mockResolvedValue(senderAddress);

      const result = await handlers.aztec_registerSender(context, [senderAddress]);

      expect(mockWallet.registerSender).toHaveBeenCalledWith(senderAddress);
      expect(result).toBe(senderAddress);
    });

    it('should propagate errors from wallet.registerSender', async () => {
      const senderAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      const error = new Error('Failed to register sender');
      vi.mocked(mockWallet.registerSender).mockRejectedValue(error);

      await expect(handlers.aztec_registerSender(context, [senderAddress])).rejects.toThrow(
        'Failed to register sender',
      );
      expect(mockWallet.registerSender).toHaveBeenCalledWith(senderAddress);
    });

    it('should handle missing sender parameter', async () => {
      await expect(handlers.aztec_registerSender(context, [] as never)).rejects.toThrow();
    });
  });

  describe('aztec_getSenders', () => {
    it('should get all registered senders', async () => {
      const senders = [
        '0x1234567890abcdef' as unknown as AztecAddress,
        '0xabcdef1234567890' as unknown as AztecAddress,
        '0x567890abcdef1234' as unknown as AztecAddress,
      ];
      vi.mocked(mockWallet.getSenders).mockResolvedValue(senders);

      const result = await handlers.aztec_getSenders(context, []);

      expect(mockWallet.getSenders).toHaveBeenCalledOnce();
      expect(result).toBe(senders);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('should handle empty senders list', async () => {
      const senders: AztecAddress[] = [];
      vi.mocked(mockWallet.getSenders).mockResolvedValue(senders);

      const result = await handlers.aztec_getSenders(context, []);

      expect(mockWallet.getSenders).toHaveBeenCalledOnce();
      expect(result).toBe(senders);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should handle single sender', async () => {
      const senders = ['0x1234567890abcdef' as unknown as AztecAddress];
      vi.mocked(mockWallet.getSenders).mockResolvedValue(senders);

      const result = await handlers.aztec_getSenders(context, []);

      expect(mockWallet.getSenders).toHaveBeenCalledOnce();
      expect(result).toBe(senders);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(senders[0]);
    });

    it('should propagate errors from wallet.getSenders', async () => {
      const error = new Error('Failed to get senders');
      vi.mocked(mockWallet.getSenders).mockRejectedValue(error);

      await expect(handlers.aztec_getSenders(context, [])).rejects.toThrow('Failed to get senders');
      expect(mockWallet.getSenders).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_removeSender', () => {
    it('should remove a sender and return true', async () => {
      const senderAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      vi.mocked(mockWallet.removeSender).mockResolvedValue(undefined);

      const result = await handlers.aztec_removeSender(context, [senderAddress]);

      expect(mockWallet.removeSender).toHaveBeenCalledWith(senderAddress);
      expect(result).toBe(true);
    });

    it('should handle different sender addresses for removal', async () => {
      const senderAddress = '0xabcdef1234567890' as unknown as AztecAddress;
      vi.mocked(mockWallet.removeSender).mockResolvedValue(undefined);

      const result = await handlers.aztec_removeSender(context, [senderAddress]);

      expect(mockWallet.removeSender).toHaveBeenCalledWith(senderAddress);
      expect(result).toBe(true);
    });

    it('should propagate errors from wallet.removeSender', async () => {
      const senderAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      const error = new Error('Failed to remove sender');
      vi.mocked(mockWallet.removeSender).mockRejectedValue(error);

      await expect(handlers.aztec_removeSender(context, [senderAddress])).rejects.toThrow(
        'Failed to remove sender',
      );
      expect(mockWallet.removeSender).toHaveBeenCalledWith(senderAddress);
    });

    it('should handle missing sender parameter', async () => {
      await expect(handlers.aztec_removeSender(context, [] as never)).rejects.toThrow();
    });

    it('should handle removal of non-existent sender', async () => {
      const senderAddress = '0xnonexistent123456' as unknown as AztecAddress;
      const error = new Error('Sender not found');
      vi.mocked(mockWallet.removeSender).mockRejectedValue(error);

      await expect(handlers.aztec_removeSender(context, [senderAddress])).rejects.toThrow('Sender not found');
      expect(mockWallet.removeSender).toHaveBeenCalledWith(senderAddress);
    });
  });
});
