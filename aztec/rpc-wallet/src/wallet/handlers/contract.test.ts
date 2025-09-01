import type { AccountWallet, AztecAddress, PXE } from '@aztec/aztec.js';
import { Fr } from '@aztec/aztec.js';
import type { ContractArtifact } from '@aztec/stdlib/abi';
import type { ContractInstanceWithAddress } from '@aztec/stdlib/contract';
import type { ContractClassMetadata, ContractMetadata } from '@aztec/stdlib/interfaces/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContractArtifactCache } from '../../contractArtifactCache.js';
import { createContractHandlers } from './contract.js';
import type { AztecHandlerContext } from './index.js';

// Mock dependencies
const createMockWallet = () =>
  ({
    registerContract: vi.fn(),
    registerContractClass: vi.fn(),
    getContractMetadata: vi.fn(),
    getContractClassMetadata: vi.fn(),
  }) as unknown as AccountWallet;

const createMockPXE = () =>
  ({
    getContracts: vi.fn(),
  }) as unknown as PXE;

const createMockContext = (wallet: AccountWallet, pxe: PXE): AztecHandlerContext => ({
  wallet,
  pxe,
  cache: {} as ContractArtifactCache,
});

describe('Contract Handlers', () => {
  let mockWallet: AccountWallet;
  let mockPXE: PXE;
  let context: AztecHandlerContext;
  let handlers: ReturnType<typeof createContractHandlers>;

  beforeEach(() => {
    mockWallet = createMockWallet();
    mockPXE = createMockPXE();
    context = createMockContext(mockWallet, mockPXE);
    handlers = createContractHandlers();
  });

  describe('aztec_registerContract', () => {
    it('should register contract with instance only', async () => {
      const instance = {
        address: '0x1234567890abcdef' as unknown as AztecAddress,
        version: 1,
        salt: new Fr(42n),
        deployer: '0xabcdef1234567890' as unknown as AztecAddress,
        contractClassId: new Fr(123n),
        initializationHash: new Fr(456n),
        publicKeysHash: new Fr(789n),
      } as unknown as ContractInstanceWithAddress;

      vi.mocked(mockWallet.registerContract).mockResolvedValue(undefined);

      const result = await handlers.aztec_registerContract(context, [instance, undefined]);

      expect(mockWallet.registerContract).toHaveBeenCalledWith({ instance });
      expect(result).toBe(true);
    });

    it('should register contract with instance and artifact', async () => {
      const instance = {
        address: '0x1234567890abcdef' as unknown as AztecAddress,
        version: 1,
        salt: new Fr(42n),
        deployer: '0xabcdef1234567890' as unknown as AztecAddress,
        contractClassId: new Fr(123n),
        initializationHash: new Fr(456n),
        publicKeysHash: new Fr(789n),
      } as unknown as ContractInstanceWithAddress;

      const artifact = {
        name: 'TestContract',
        functions: [],
        outputs: { structs: {}, globals: {} },
        fileMap: {},
        storageLayout: {},
        notes: {},
      } as unknown as ContractArtifact;

      vi.mocked(mockWallet.registerContract).mockResolvedValue(undefined);

      const result = await handlers.aztec_registerContract(context, [instance, artifact]);

      expect(mockWallet.registerContract).toHaveBeenCalledWith({ instance, artifact });
      expect(result).toBe(true);
    });

    it('should propagate errors from wallet.registerContract', async () => {
      const instance = {
        address: '0x1234567890abcdef' as unknown as AztecAddress,
      } as unknown as ContractInstanceWithAddress;

      const error = new Error('Failed to register contract');
      vi.mocked(mockWallet.registerContract).mockRejectedValue(error);

      await expect(handlers.aztec_registerContract(context, [instance, undefined])).rejects.toThrow(
        'Failed to register contract',
      );
      expect(mockWallet.registerContract).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_registerContractClass', () => {
    it('should register contract class with artifact', async () => {
      const artifact = {
        name: 'TestContract',
        functions: [],
        outputs: { structs: {}, globals: {} },
        fileMap: {},
        storageLayout: {},
        notes: {},
      } as unknown as ContractArtifact;

      vi.mocked(mockWallet.registerContractClass).mockResolvedValue(undefined);

      const result = await handlers.aztec_registerContractClass(context, [artifact]);

      expect(mockWallet.registerContractClass).toHaveBeenCalledWith(artifact);
      expect(result).toBe(true);
    });

    it('should propagate errors from wallet.registerContractClass', async () => {
      const artifact = {
        name: 'TestContract',
      } as unknown as ContractArtifact;

      const error = new Error('Failed to register contract class');
      vi.mocked(mockWallet.registerContractClass).mockRejectedValue(error);

      await expect(handlers.aztec_registerContractClass(context, [artifact])).rejects.toThrow(
        'Failed to register contract class',
      );
      expect(mockWallet.registerContractClass).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_getContractMetadata', () => {
    it('should get contract metadata for given address', async () => {
      const address = '0x1234567890abcdef' as unknown as AztecAddress;
      const expectedMetadata = {
        name: 'TestContract',
        portalContractAddress: '0xabc123' as unknown as AztecAddress,
        blockNumber: 42,
      } as unknown as ContractMetadata;

      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue(expectedMetadata);

      const result = await handlers.aztec_getContractMetadata(context, [address]);

      expect(mockWallet.getContractMetadata).toHaveBeenCalledWith(address);
      expect(result).toBe(expectedMetadata);
    });

    it('should propagate errors from wallet.getContractMetadata', async () => {
      const address = '0x1234567890abcdef' as unknown as AztecAddress;
      const error = new Error('Contract not found');
      vi.mocked(mockWallet.getContractMetadata).mockRejectedValue(error);

      await expect(handlers.aztec_getContractMetadata(context, [address])).rejects.toThrow(
        'Contract not found',
      );
      expect(mockWallet.getContractMetadata).toHaveBeenCalledWith(address);
    });
  });

  describe('aztec_getContracts', () => {
    it('should get all contracts from PXE', async () => {
      const expectedContracts = [
        '0x1234567890abcdef' as unknown as AztecAddress,
        '0xabcdef1234567890' as unknown as AztecAddress,
      ];

      vi.mocked(mockPXE.getContracts).mockResolvedValue(expectedContracts);

      const result = await handlers.aztec_getContracts(context, []);

      expect(mockPXE.getContracts).toHaveBeenCalledOnce();
      expect(result).toBe(expectedContracts);
    });

    it('should propagate errors from pxe.getContracts', async () => {
      const error = new Error('Failed to get contracts');
      vi.mocked(mockPXE.getContracts).mockRejectedValue(error);

      await expect(handlers.aztec_getContracts(context, [])).rejects.toThrow('Failed to get contracts');
      expect(mockPXE.getContracts).toHaveBeenCalledOnce();
    });
  });

  describe('aztec_getContractClassMetadata', () => {
    it('should get contract class metadata without artifact', async () => {
      const id = new Fr(123n);
      const expectedMetadata = {
        id,
        artifactHash: new Fr(456n),
        privateFunctionsRoot: new Fr(789n),
        packedBytecode: Buffer.from('bytecode'),
      } as unknown as ContractClassMetadata;

      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue(expectedMetadata);

      const result = await handlers.aztec_getContractClassMetadata(context, [id, undefined]);

      expect(mockWallet.getContractClassMetadata).toHaveBeenCalledWith(id, false);
      expect(result).toBe(expectedMetadata);
    });

    it('should get contract class metadata with artifact', async () => {
      const id = new Fr(123n);
      const includeArtifact = true;
      const expectedMetadata = {
        id,
        artifactHash: new Fr(456n),
        privateFunctionsRoot: new Fr(789n),
        packedBytecode: Buffer.from('bytecode'),
        artifact: {
          name: 'TestContract',
          functions: [],
        },
      } as unknown as ContractClassMetadata;

      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue(expectedMetadata);

      const result = await handlers.aztec_getContractClassMetadata(context, [id, includeArtifact]);

      expect(mockWallet.getContractClassMetadata).toHaveBeenCalledWith(id, includeArtifact);
      expect(result).toBe(expectedMetadata);
    });

    it('should propagate errors from wallet.getContractClassMetadata', async () => {
      const id = new Fr(123n);
      const error = new Error('Contract class not found');
      vi.mocked(mockWallet.getContractClassMetadata).mockRejectedValue(error);

      await expect(handlers.aztec_getContractClassMetadata(context, [id, undefined])).rejects.toThrow(
        'Contract class not found',
      );
      expect(mockWallet.getContractClassMetadata).toHaveBeenCalledWith(id, false);
    });
  });
});
