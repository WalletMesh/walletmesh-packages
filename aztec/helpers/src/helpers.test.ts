import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  AztecAddress,
  Fr,
  FunctionSelector,
  type PXE,
  type ContractArtifact,
  type FunctionArtifact,
  type ContractInstanceWithAddress,
  PublicKeys,
} from '@aztec/aztec.js';
import { FunctionType } from '@aztec/stdlib/abi'; // Corrected import path
import {
  getContractArtifactFromContractAddress,
  getFunctionArtifactFromContractAddress,
  getFunctionParameterInfoFromContractAddress,
} from './helpers.js';
import { Buffer } from 'node:buffer';

describe('aztec helpers', () => {
  let mockPXE: PXE;
  let mockContractAddress: AztecAddress;
  let mockContractClassId: Fr;

  beforeEach(async () => {
    mockContractAddress = await AztecAddress.random();
    mockContractClassId = Fr.random();

    // Create mock PXE
    mockPXE = {
      getContractMetadata: vi.fn(),
      getContractClassMetadata: vi.fn(),
    } as unknown as PXE;
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

      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPubliclyDeployed: true,
      });
      vi.mocked(mockPXE.getContractClassMetadata).mockResolvedValue({
        artifact: mockArtifact,
        isContractClassPubliclyRegistered: true,
      });

      // First call - should fetch from PXE
      const result1 = await getContractArtifactFromContractAddress(mockPXE, mockContractAddress.toString());
      expect(result1).toEqual(mockArtifact);
      expect(mockPXE.getContractMetadata).toHaveBeenCalledTimes(1);
      expect(mockPXE.getContractClassMetadata).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await getContractArtifactFromContractAddress(mockPXE, mockContractAddress.toString());
      expect(result2).toEqual(mockArtifact);
      expect(mockPXE.getContractMetadata).toHaveBeenCalledTimes(1); // No additional calls
      expect(mockPXE.getContractClassMetadata).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should throw if contract is not registered', async () => {
      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: undefined,
        isContractInitialized: false,
        isContractPubliclyDeployed: false,
      });

      await expect(
        getContractArtifactFromContractAddress(mockPXE, mockContractAddress.toString()),
      ).rejects.toThrow('not registered in the PXE');
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
      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPubliclyDeployed: true,
      });
      vi.mocked(mockPXE.getContractClassMetadata).mockResolvedValue({
        artifact: undefined,
        isContractClassPubliclyRegistered: false,
      });

      await expect(
        getContractArtifactFromContractAddress(mockPXE, mockContractAddress.toString()),
      ).rejects.toThrow('not registered in the PXE');
    });
  });

  describe('getFunctionArtifactFromContractAddress', () => {
    const mockFunctionArtifact: FunctionArtifact = {
      name: 'testFunction',
      parameters: [{ name: 'param1', type: { kind: 'field' }, visibility: 'public' }],
      bytecode: Buffer.from([]),
      debugSymbols: '',
      functionType: FunctionType.PUBLIC,
      isInternal: false,
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
      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPubliclyDeployed: true,
      });
      vi.mocked(mockPXE.getContractClassMetadata).mockResolvedValue({
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
        mockPXE,
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
      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPubliclyDeployed: true,
      });
      vi.mocked(mockPXE.getContractClassMetadata).mockResolvedValue({
        artifact: mockArtifact,
        isContractClassPubliclyRegistered: true,
      });

      const result = await getFunctionArtifactFromContractAddress(
        mockPXE,
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
      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPubliclyDeployed: true,
      });
      vi.mocked(mockPXE.getContractClassMetadata).mockResolvedValue({
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
        getFunctionArtifactFromContractAddress(mockPXE, mockContractAddress.toString(), 'nonexistent'),
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
        isInternal: false,
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
      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPubliclyDeployed: true,
      });
      vi.mocked(mockPXE.getContractClassMetadata).mockResolvedValue({
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
        mockPXE,
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
        isInternal: false,
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
      vi.mocked(mockPXE.getContractMetadata).mockResolvedValue({
        contractInstance: mockInstance,
        isContractInitialized: true,
        isContractPubliclyDeployed: true,
      });
      vi.mocked(mockPXE.getContractClassMetadata).mockResolvedValue({
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
        mockPXE,
        mockContractAddress.toString(),
        'testFunction',
      );

      expect(result).toEqual([{ name: 'structParam', type: 'MyStruct' }]);
    });
  });
});
