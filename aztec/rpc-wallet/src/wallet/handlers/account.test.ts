import type {
  AccountWallet,
  AuthWitness,
  AztecAddress,
  CompleteAddress,
  FunctionSelector,
  FunctionType,
  PXE,
} from '@aztec/aztec.js';
import { Fr } from '@aztec/aztec.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContractArtifactCache } from '../../contractArtifactCache.js';
import { createAccountHandlers } from './account.js';
import type { AztecHandlerContext } from './index.js';

// Mock dependencies
const createMockWallet = () =>
  ({
    getAddress: vi.fn(),
    getCompleteAddress: vi.fn(),
    createAuthWit: vi.fn(),
  }) as unknown as AccountWallet;

const createMockContext = (wallet: AccountWallet): AztecHandlerContext => ({
  wallet,
  pxe: {} as PXE,
  cache: {} as ContractArtifactCache,
});

describe('Account Handlers', () => {
  let mockWallet: AccountWallet;
  let context: AztecHandlerContext;
  let handlers: ReturnType<typeof createAccountHandlers>;

  beforeEach(() => {
    mockWallet = createMockWallet();
    context = createMockContext(mockWallet);
    handlers = createAccountHandlers();
  });

  describe('aztec_getAddress', () => {
    it('should call wallet.getAddress and return the result', async () => {
      const expectedAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      vi.mocked(mockWallet.getAddress).mockResolvedValue(expectedAddress);

      const result = await handlers.aztec_getAddress(context, []);

      expect(mockWallet.getAddress).toHaveBeenCalledOnce();
      expect(result).toBe(expectedAddress);
    });

    it('should propagate errors from wallet.getAddress', async () => {
      const error = new Error('Failed to get address');
      vi.mocked(mockWallet.getAddress).mockRejectedValue(error);

      await expect(handlers.aztec_getAddress(context, [])).rejects.toThrow('Failed to get address');
      expect(mockWallet.getAddress).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_getCompleteAddress', () => {
    it('should call wallet.getCompleteAddress and return the result', async () => {
      const expectedCompleteAddress = {
        address: '0x1234567890abcdef' as unknown as AztecAddress,
        publicKeysHash: new Fr(0x123n),
        partialAddress: new Fr(0x456n),
      } as unknown as CompleteAddress;
      vi.mocked(mockWallet.getCompleteAddress).mockResolvedValue(expectedCompleteAddress);

      const result = await handlers.aztec_getCompleteAddress(context, []);

      expect(mockWallet.getCompleteAddress).toHaveBeenCalledOnce();
      expect(result).toBe(expectedCompleteAddress);
    });

    it('should propagate errors from wallet.getCompleteAddress', async () => {
      const error = new Error('Failed to get complete address');
      vi.mocked(mockWallet.getCompleteAddress).mockRejectedValue(error);

      await expect(handlers.aztec_getCompleteAddress(context, [])).rejects.toThrow(
        'Failed to get complete address',
      );
      expect(mockWallet.getCompleteAddress).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_createAuthWit', () => {
    it('should create AuthWit with Fr intent', async () => {
      const frIntent = new Fr(42n);
      const expectedAuthWit = {
        witness: [new Fr(0x123n)],
        predicate: '0xabc' as unknown as AztecAddress,
      } as unknown as AuthWitness;
      vi.mocked(mockWallet.createAuthWit).mockResolvedValue(expectedAuthWit);

      const result = await handlers.aztec_createAuthWit(context, [frIntent]);

      expect(mockWallet.createAuthWit).toHaveBeenCalledWith(frIntent);
      expect(result).toBe(expectedAuthWit);
    });

    it('should create AuthWit with Buffer intent', async () => {
      const bufferIntent = Buffer.from('test intent');
      const expectedAuthWit = {
        witness: [new Fr(0x456n)],
        predicate: '0xdef' as unknown as AztecAddress,
      } as unknown as AuthWitness;
      vi.mocked(mockWallet.createAuthWit).mockResolvedValue(expectedAuthWit);

      const result = await handlers.aztec_createAuthWit(context, [bufferIntent]);

      expect(mockWallet.createAuthWit).toHaveBeenCalledWith(bufferIntent);
      expect(result).toBe(expectedAuthWit);
    });

    it('should create AuthWit with IntentAction intent', async () => {
      const intentAction = {
        caller: '0x0987654321fedcba' as unknown as AztecAddress,
        action: {
          to: '0x1234567890abcdef' as unknown as AztecAddress,
          selector: { toField: () => new Fr(0xabcdefn) } as FunctionSelector,
          args: [new Fr(0x123n), new Fr(0x456n)],
          name: 'transfer',
          type: 'private' as FunctionType,
          isStatic: false,
          returnTypes: [],
        },
      };
      const expectedAuthWit = {
        witness: [new Fr(0x789n)],
        predicate: '0x012' as unknown as AztecAddress,
      } as unknown as AuthWitness;
      vi.mocked(mockWallet.createAuthWit).mockResolvedValue(expectedAuthWit);

      const result = await handlers.aztec_createAuthWit(context, [intentAction]);

      expect(mockWallet.createAuthWit).toHaveBeenCalledWith(intentAction);
      expect(result).toBe(expectedAuthWit);
    });

    it('should create AuthWit with IntentInnerHash intent', async () => {
      const intentInnerHash = {
        innerHash: new Fr(123n),
        consumer: '0x1234567890abcdef' as unknown as AztecAddress,
      };
      const expectedAuthWit = {
        witness: [new Fr(0xabcn)],
        predicate: '0x123' as unknown as AztecAddress,
      } as unknown as AuthWitness;
      vi.mocked(mockWallet.createAuthWit).mockResolvedValue(expectedAuthWit);

      const result = await handlers.aztec_createAuthWit(context, [intentInnerHash]);

      expect(mockWallet.createAuthWit).toHaveBeenCalledWith(intentInnerHash);
      expect(result).toBe(expectedAuthWit);
    });

    it('should propagate errors from wallet.createAuthWit', async () => {
      const error = new Error('Failed to create AuthWit');
      vi.mocked(mockWallet.createAuthWit).mockRejectedValue(error);

      await expect(handlers.aztec_createAuthWit(context, [new Fr(42n)])).rejects.toThrow(
        'Failed to create AuthWit',
      );
      expect(mockWallet.createAuthWit).toHaveBeenCalledOnce();
    });

    it('should handle missing intent parameter', async () => {
      await expect(handlers.aztec_createAuthWit(context, [] as never)).rejects.toThrow();
    });
  });
});
