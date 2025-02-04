import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import type { AztecAddress, ContractArtifact, ContractClassWithId, Wallet } from '@aztec/aztec.js';
import { ContractArtifactCache } from './contractArtifactCache.js';
import { AztecWalletError } from './errors.js';

describe('ContractArtifactCache', () => {
  let wallet: Wallet;
  let cache: ContractArtifactCache;
  let mockContractAddress: AztecAddress;
  let mockContractClassId: ContractClassWithId;
  let mockArtifact: ContractArtifact;

  beforeEach(() => {
    // Mock contract address and class ID
    // Create a complete mock of AztecAddress
    mockContractAddress = {
      toString: () => '0x123',
      _branding: 'aztec.Address',
      xCoord: BigInt(0),
      size: 32,
      equals: () => false,
      toBuffer: () => Buffer.from([]),
      toFields: () => [],
      toField: () => BigInt(0),
      toBigInt: () => BigInt(0),
      isZero: () => false,
      isValid: () => true,
      toAddressPoint: () => ({ x: BigInt(0) }),
      toJSON: () => ({ x: '0' }),
      [Symbol.for('nodejs.util.inspect.custom')]: () => 'AztecAddress',
    } as unknown as AztecAddress;

    // Create a complete mock of ContractClassWithId
    mockContractClassId = {
      toString: () => '456',
      id: BigInt(456),
      version: 1,
      artifactHash: BigInt(0),
      privateFunctions: new Map(),
      publicFunctions: new Map(),
      packedBytecode: new Uint8Array(),
    } as unknown as ContractClassWithId;
    mockArtifact = { name: 'TestContract' } as ContractArtifact;

    // Create mock wallet
    wallet = {
      getContractInstance: vi.fn(),
      getContractArtifact: vi.fn(),
    } as unknown as Wallet;

    // Initialize cache with mock wallet
    cache = new ContractArtifactCache(wallet);
  });

  it('returns cached artifact if available', async () => {
    // Setup: Pre-populate cache
    (cache as unknown as { cache: Map<string, ContractArtifact> }).cache.set(
      mockContractAddress.toString(),
      mockArtifact,
    );

    // Test: Get artifact
    const result = await cache.getContractArtifact(mockContractAddress);

    // Verify: Result is from cache, wallet methods not called
    expect(result).toBe(mockArtifact);
    expect(wallet.getContractInstance).not.toHaveBeenCalled();
    expect(wallet.getContractArtifact).not.toHaveBeenCalled();
  });

  it('fetches and caches artifact on cache miss', async () => {
    // Setup: Configure wallet mocks
    (wallet.getContractInstance as Mock).mockResolvedValue({ contractClassId: mockContractClassId });
    (wallet.getContractArtifact as Mock).mockResolvedValue(mockArtifact);

    // Test: Get artifact
    const result = await cache.getContractArtifact(mockContractAddress);

    // Verify: Correct methods called and result cached
    expect(wallet.getContractInstance).toHaveBeenCalledWith(mockContractAddress);
    expect(wallet.getContractArtifact).toHaveBeenCalledWith(mockContractClassId);
    expect(result).toBe(mockArtifact);

    // Verify: Result was cached
    expect(
      (cache as unknown as { cache: Map<string, ContractArtifact> }).cache.get(
        mockContractAddress.toString(),
      ),
    ).toBe(mockArtifact);
  });

  it('throws error if contract instance not found', async () => {
    // Setup: Mock contract instance not found
    (wallet.getContractInstance as Mock).mockResolvedValue(null);

    // Test & Verify: Expect error
    await expect(cache.getContractArtifact(mockContractAddress)).rejects.toThrow(
      new AztecWalletError('contractInstanceNotRegistered', mockContractAddress.toString()),
    );

    // Verify: Nothing cached
    expect(
      (cache as unknown as { cache: Map<string, ContractArtifact> }).cache.get(
        mockContractAddress.toString(),
      ),
    ).toBeUndefined();
  });

  it('throws error if contract artifact not found', async () => {
    // Setup: Mock contract instance found but artifact missing
    (wallet.getContractInstance as Mock).mockResolvedValue({ contractClassId: mockContractClassId });
    (wallet.getContractArtifact as Mock).mockResolvedValue(null);

    // Test & Verify: Expect error
    await expect(cache.getContractArtifact(mockContractAddress)).rejects.toThrow(
      new AztecWalletError('contractClassNotRegistered', mockContractClassId.toString()),
    );

    // Verify: Nothing cached
    expect(
      (cache as unknown as { cache: Map<string, ContractArtifact> }).cache.get(
        mockContractAddress.toString(),
      ),
    ).toBeUndefined();
  });
});
