import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import type { AztecAddress, ContractArtifact, Fr, Wallet } from '@aztec/aztec.js';
import { ContractArtifactCache } from './contractArtifactCache.js';
import { AztecWalletError } from './errors.js';

describe('ContractArtifactCache', () => {
  let wallet: Wallet;
  let cache: ContractArtifactCache;
  let mockContractAddress: AztecAddress;
  let mockContractClassId: Fr;
  let mockArtifact: ContractArtifact;

  beforeEach(async () => {
    // Mock contract address and class ID
    // Create mocks instead of using randomDeployedContract to avoid native binding issues
    mockContractAddress = {
      toString: () => '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      equals: () => false,
      isZero: () => false,
      toField: () => mockContractClassId,
    } as unknown as AztecAddress;

    mockContractClassId = {
      toString: () => '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      toBigInt: () => BigInt(123),
    } as unknown as Fr;

    mockArtifact = {
      name: 'TestContract',
      functions: [],
      outputs: {},
      fileMap: {},
    } as unknown as ContractArtifact;

    // Create mock wallet
    wallet = {
      getContractMetadata: vi.fn(),
      getContractClassMetadata: vi.fn(),
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
    expect(wallet.getContractMetadata).not.toHaveBeenCalled();
    expect(wallet.getContractClassMetadata).not.toHaveBeenCalled();
  });

  it('fetches and caches artifact on cache miss', async () => {
    // Setup: Configure wallet mocks
    (wallet.getContractMetadata as Mock).mockResolvedValue({
      contractInstance: { currentContractClassId: mockContractClassId },
    });
    (wallet.getContractClassMetadata as Mock).mockResolvedValue({ artifact: mockArtifact });

    // Test: Get artifact
    const result = await cache.getContractArtifact(mockContractAddress);

    // Verify: Correct methods called and result cached
    expect(wallet.getContractMetadata).toHaveBeenCalledWith(mockContractAddress);
    expect(wallet.getContractClassMetadata).toHaveBeenCalledWith(mockContractClassId);
    expect(result).toBe(mockArtifact);

    // Verify: Result was cached
    expect(
      (cache as unknown as { cache: Map<string, ContractArtifact> }).cache.get(
        mockContractAddress.toString(),
      ),
    ).toBe(mockArtifact);
  });

  it('throws error if contract metadata not found', async () => {
    // Setup: Mock contract instance not found
    (wallet.getContractMetadata as Mock).mockResolvedValue({ contractInstance: undefined });

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

  it('throws error if contract class metadata not found', async () => {
    // Setup: Mock contract metadata found but class metadata missing
    (wallet.getContractMetadata as Mock).mockResolvedValue({
      contractInstance: { currentContractClassId: mockContractClassId },
    });
    (wallet.getContractClassMetadata as Mock).mockResolvedValue({ artifact: undefined });

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
