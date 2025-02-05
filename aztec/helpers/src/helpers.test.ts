import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  AztecAddress,
  Fr,
  type FunctionSelector,
  type PXE,
  type ContractArtifact,
  type FunctionArtifact,
  type ContractInstanceWithAddress,
  PublicKeys,
} from '@aztec/aztec.js';
import { FunctionType, type ABIParameter } from '@aztec/foundation/abi';
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
      getContractInstance: vi.fn(),
      getContractArtifact: vi.fn(),
    } as unknown as PXE;
  });

  describe('getContractArtifactFromContractAddress', () => {
    it('should fetch and cache contract artifact', async () => {
      const mockArtifact = {
        name: 'TestContract',
        functions: [],
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact;

      // Setup mocks
      const mockInstance = {
        contractClassId: mockContractClassId,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(mockInstance);
      vi.mocked(mockPXE.getContractArtifact).mockResolvedValue(mockArtifact);

      // First call - should fetch from PXE
      const result1 = await getContractArtifactFromContractAddress(mockPXE, mockContractAddress.toString());
      expect(result1).toEqual(mockArtifact);
      expect(mockPXE.getContractInstance).toHaveBeenCalledTimes(1);
      expect(mockPXE.getContractArtifact).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await getContractArtifactFromContractAddress(mockPXE, mockContractAddress.toString());
      expect(result2).toEqual(mockArtifact);
      expect(mockPXE.getContractInstance).toHaveBeenCalledTimes(1); // No additional calls
      expect(mockPXE.getContractArtifact).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should throw if contract is not registered', async () => {
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(undefined);

      await expect(
        getContractArtifactFromContractAddress(mockPXE, mockContractAddress.toString()),
      ).rejects.toThrow('not registered in the PXE');
    });

    it('should throw if artifact is not found', async () => {
      const mockInstance = {
        contractClassId: mockContractClassId,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(mockInstance);
      vi.mocked(mockPXE.getContractArtifact).mockResolvedValue(undefined);

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
        contractClassId: mockContractClassId,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(mockInstance);
      vi.mocked(mockPXE.getContractArtifact).mockResolvedValue({
        name: 'TestContract',
        functions: [mockFunctionArtifact],
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact);

      const result = await getFunctionArtifactFromContractAddress(
        mockPXE,
        mockContractAddress.toString(),
        'testFunction',
      );
      expect(result).toEqual(mockFunctionArtifact);
    });

    it('should find function by selector', async () => {
      // Create a mock selector that will match our function
      const selector = {
        equals: (name: string, parameters: ABIParameter[]) =>
          name === 'testFunction' && parameters.length === 1 && parameters[0]?.type?.kind === 'field',
        toString: () => 'MockSelector',
      } as unknown as FunctionSelector;

      const mockInstance = {
        contractClassId: mockContractClassId,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(mockInstance);
      vi.mocked(mockPXE.getContractArtifact).mockResolvedValue({
        name: 'TestContract',
        functions: [mockFunctionArtifact],
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact);

      const result = await getFunctionArtifactFromContractAddress(
        mockPXE,
        mockContractAddress.toString(),
        selector,
      );
      expect(result).toEqual(mockFunctionArtifact);
    });

    it('should throw if function is not found', async () => {
      const mockInstance = {
        contractClassId: mockContractClassId,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(mockInstance);
      vi.mocked(mockPXE.getContractArtifact).mockResolvedValue({
        name: 'TestContract',
        functions: [],
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact);

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
        contractClassId: mockContractClassId,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(mockInstance);
      vi.mocked(mockPXE.getContractArtifact).mockResolvedValue({
        name: 'TestContract',
        functions: [mockFunctionArtifact],
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact);

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
        contractClassId: mockContractClassId,
        version: 1,
        salt: Fr.random(),
        deployer: await AztecAddress.random(),
        initializationHash: Fr.random(),
        publicKeys: await PublicKeys.random(),
        address: mockContractAddress,
      } as ContractInstanceWithAddress;
      vi.mocked(mockPXE.getContractInstance).mockResolvedValue(mockInstance);
      vi.mocked(mockPXE.getContractArtifact).mockResolvedValue({
        name: 'TestContract',
        functions: [mockFunctionArtifact],
        outputs: { structs: {}, globals: {} },
        storageLayout: {},
        notes: {},
        fileMap: {},
      } as ContractArtifact);

      const result = await getFunctionParameterInfoFromContractAddress(
        mockPXE,
        mockContractAddress.toString(),
        'testFunction',
      );

      expect(result).toEqual([{ name: 'structParam', type: 'MyStruct' }]);
    });
  });
});
