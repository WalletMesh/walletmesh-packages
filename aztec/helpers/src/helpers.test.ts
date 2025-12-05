import { Buffer } from 'node:buffer';
import { type ContractArtifact, FunctionSelector } from '@aztec/aztec.js/abi';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import type { ContractInstanceWithAddress } from '@aztec/aztec.js/contracts';
import { Fr } from '@aztec/aztec.js/fields';
import { PublicKeys } from '@aztec/aztec.js/keys';
import type { Wallet } from '@aztec/aztec.js/wallet';
import { type FunctionArtifact, type FunctionArtifactWithContractName, FunctionType } from '@aztec/stdlib/abi'; // Corrected import path
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getContractArtifactFromContractAddress,
  getFunctionArtifactFromContractAddress,
  getFunctionParameterInfoFromContractAddress,
} from './helpers.js';

describe('aztec helpers', () => {
  let mockWallet: Wallet;
  let mockContractAddress: AztecAddress;
  let mockContractClassId: Fr;

  beforeEach(async () => {
    mockContractAddress = await AztecAddress.random();
    mockContractClassId = Fr.random();

    // Create mock Wallet
    mockWallet = {
      getContractMetadata: vi.fn(),
      getContractClassMetadata: vi.fn(),
    } as unknown as Wallet;
  });

  describe('getContractArtifactFromContractAddress', () => {
    it('should fetch and cache contract artifact', async () => {
      const mockArtifact = {
        name: 'TestContract',
        functions: [],
        nonDispatchPublicFunctions: [], // Added missing property
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact;

      // Setup mocks
      const mockInstance = {
        currentContractClassId: mockContractClassId, // Renamed
        originalContractClassId: mockContractClassId, // Added
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;

      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPublished: true,
      });
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue({
        artifact: mockArtifact,
        isContractClassPubliclyRegistered: true,
      });

      // First call - should fetch from PXE
      const result1 = await getContractArtifactFromContractAddress(mockWallet, mockContractAddress.toString());
      expect(result1).toEqual(mockArtifact);
      expect(mockWallet.getContractMetadata).toHaveBeenCalledTimes(1);
      expect(mockWallet.getContractClassMetadata).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await getContractArtifactFromContractAddress(mockWallet, mockContractAddress.toString());
      expect(result2).toEqual(mockArtifact);
      expect(mockWallet.getContractMetadata).toHaveBeenCalledTimes(1); // No additional calls
      expect(mockWallet.getContractClassMetadata).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should throw if contract is not registered', async () => {
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: undefined,
        isContractInitialized: false,
        isContractPublished: false,
      });

      await expect(
        getContractArtifactFromContractAddress(mockWallet, mockContractAddress.toString()),
      ).rejects.toThrow('not registered in the Wallet');
    });

    it('should throw if artifact is not found', async () => {
      const mockInstance = {
        currentContractClassId: mockContractClassId, // Renamed
        originalContractClassId: mockContractClassId, // Added
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPublished: true,
      });
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue({
        artifact: undefined,
        isContractClassPubliclyRegistered: false,
      });

      await expect(
        getContractArtifactFromContractAddress(mockWallet, mockContractAddress.toString()),
      ).rejects.toThrow('not registered in the Wallet');
    });
  });

  describe('getFunctionArtifactFromContractAddress', () => {
    const mockFunctionArtifact: FunctionArtifactWithContractName = {
      name: 'testFunction',
      parameters: [{ name: 'param1', type: { kind: 'field' }, visibility: 'public' }],
      bytecode: Buffer.from([]),
      contractName: 'TestContract',
      debugSymbols: '',
      functionType: FunctionType.PUBLIC,
      isOnlySelf: false,
      returnTypes: [{ kind: 'field' }],
      isStatic: false,
      errorTypes: {},
      isInitializer: false,
    };

    it('should find function by name', async () => {
      const mockInstance = {
        currentContractClassId: mockContractClassId, // Renamed
        originalContractClassId: mockContractClassId, // Added
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPublished: true,
      });
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue({
        artifact: {
          name: 'TestContract',
          functions: [mockFunctionArtifact],
          nonDispatchPublicFunctions: [], // Added missing property
          outputs: { structs: {}, globals: {} },
          storageLayout: {},
          notes: {},
          fileMap: {},
        } as ContractArtifact,
        isContractClassPubliclyRegistered: true,
      });

      const result = await getFunctionArtifactFromContractAddress(
        mockWallet,
        mockContractAddress.toString(),
        'testFunction',
      );
      expect(result).toEqual({
        ...mockFunctionArtifact,
        contractName: 'TestContract',
        debug: undefined,
      });
    });

    it('should find function by selector', async () => {
      // Create the selector first since it's async
      const mockSelector = await FunctionSelector.fromNameAndParameters(
        mockFunctionArtifact.name,
        mockFunctionArtifact.parameters,
      );

      const mockArtifact = {
        name: 'TestContract',
        functions: [mockFunctionArtifact],
        nonDispatchPublicFunctions: [], // Added missing property
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact;

      const mockInstance = {
        currentContractClassId: mockContractClassId, // Renamed
        originalContractClassId: mockContractClassId, // Added
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPublished: true,
      });
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue({
        artifact: mockArtifact,
        isContractClassPubliclyRegistered: true,
      });

      const result = await getFunctionArtifactFromContractAddress(
        mockWallet,
        mockContractAddress.toString(),
        mockSelector,
      );
      // The function should be found since it exists in the mock artifact
      expect(result).toEqual({
        ...mockFunctionArtifact,
        contractName: 'TestContract',
        debug: undefined,
      });
    });

    it('should throw if function is not found', async () => {
      const mockInstance = {
        currentContractClassId: mockContractClassId, // Renamed
        originalContractClassId: mockContractClassId, // Added
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPublished: true,
      });
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue({
        artifact: {
          name: 'TestContract',
          functions: [],
          nonDispatchPublicFunctions: [], // Added missing property
          outputs: { structs: {}, globals: {} },
          storageLayout: {},
          notes: {},
          fileMap: {},
        } as ContractArtifact,
        isContractClassPubliclyRegistered: true,
      });

      await expect(
        getFunctionArtifactFromContractAddress(mockWallet, mockContractAddress.toString(), 'nonexistent'),
      ).rejects.toThrow('Unknown function');
    });
  });

  describe('getFunctionParameterInfoFromContractAddress', () => {
    it('should return parameter info for primitive types', async () => {
      const mockFunctionArtifact: FunctionArtifact = {
        name: 'testFunction',
        parameters: [
          { name: 'param1', type: { kind: 'field' }, visibility: 'public' },
          { name: 'param2', type: { kind: 'boolean' }, visibility: 'public' },
        ],
        bytecode: Buffer.from([]),
        debugSymbols: '',
        functionType: FunctionType.PUBLIC,
        isOnlySelf: false,
        returnTypes: [{ kind: 'field' }],
        isStatic: false,
        errorTypes: {},
        isInitializer: false,
      };

      const mockInstance = {
        currentContractClassId: mockContractClassId, // Renamed
        originalContractClassId: mockContractClassId, // Added
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPublished: true,
      });
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue({
        artifact: {
          name: 'TestContract',
          functions: [mockFunctionArtifact],
          nonDispatchPublicFunctions: [], // Added missing property
          outputs: { structs: {}, globals: {} },
          storageLayout: {},
          notes: {},
          fileMap: {},
        } as ContractArtifact,
        isContractClassPubliclyRegistered: true,
      });

      const result = await getFunctionParameterInfoFromContractAddress(
        mockWallet,
        mockContractAddress.toString(),
        'testFunction',
      );

      expect(result).toEqual([
        { name: 'param1', type: 'field' },
        { name: 'param2', type: 'boolean' },
      ]);
    });

    it('should handle struct types', async () => {
      const mockFunctionArtifact: FunctionArtifact = {
        name: 'testFunction',
        parameters: [
          {
            name: 'structParam',
            type: {
              kind: 'struct',
              path: 'MyStruct',
              fields: [],
            },
            visibility: 'public',
          },
        ],
        bytecode: Buffer.from([]),
        debugSymbols: '',
        functionType: FunctionType.PUBLIC,
        isOnlySelf: false,
        returnTypes: [{ kind: 'field' }],
        isStatic: false,
        errorTypes: {},
        isInitializer: false,
      };

      const mockInstance = {
        currentContractClassId: mockContractClassId, // Renamed
        originalContractClassId: mockContractClassId, // Added
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockWallet.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPublished: true,
      });
      vi.mocked(mockWallet.getContractClassMetadata).mockResolvedValue({
        artifact: {
          name: 'TestContract',
          functions: [mockFunctionArtifact],
          nonDispatchPublicFunctions: [], // Added missing property
          outputs: { structs: {}, globals: {} },
          storageLayout: {},
          notes: {},
          fileMap: {},
        } as ContractArtifact,
        isContractClassPubliclyRegistered: true,
      });

      const result = await getFunctionParameterInfoFromContractAddress(
        mockWallet,
        mockContractAddress.toString(),
        'testFunction',
      );

      expect(result).toEqual([{ name: 'structParam', type: 'MyStruct' }]);
    });
  });
});
