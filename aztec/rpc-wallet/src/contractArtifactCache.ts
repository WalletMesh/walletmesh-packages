/**
 * @module contractArtifactCache
 *
 * This module provides caching functionality for Aztec contract artifacts.
 * It helps improve performance by avoiding repeated fetches of the same contract artifacts.
 */

import type { AztecAddress, ContractArtifact, Wallet } from '@aztec/aztec.js';

import { AztecWalletError } from './errors.js';

/**
 * Caches contract artifacts to optimize contract interactions.
 *
 * This class maintains an in-memory cache of contract artifacts indexed by contract address.
 * When a contract artifact is requested:
 * 1. First checks the cache for an existing artifact
 * 2. If not found, fetches the contract instance and its artifact from the wallet
 * 3. Stores the artifact in the cache for future use
 * 4. Returns the artifact to the caller
 *
 * This caching mechanism helps reduce:
 * - Network requests to fetch contract data
 * - Processing overhead of parsing contract artifacts
 * - Memory usage by reusing existing artifacts
 */
export class ContractArtifactCache {
  /** Map of contract addresses to their artifacts */
  private cache = new Map<string, ContractArtifact>();
  /** Reference to the wallet instance for fetching contract data */
  private wallet: Wallet;

  /**
   * Creates a new ContractArtifactCache instance.
   * @param wallet - Wallet instance used to fetch contract data when cache misses occur
   */
  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  /**
   * Retrieves the contract artifact for a given contract address.
   * First checks the cache, then falls back to fetching from the wallet if needed.
   *
   * The process:
   * 1. Check if artifact exists in cache
   * 2. If not, get contract instance from wallet
   * 3. Use instance to get contract class ID
   * 4. Fetch artifact using class ID
   * 5. Cache the artifact for future use
   *
   * @param contractAddress - The contract address to retrieve the artifact for
   * @returns Promise resolving to the contract artifact
   * @throws {AztecWalletError} If contract instance or class not registered
   */
  public async getContractArtifact(contractAddress: AztecAddress): Promise<ContractArtifact> {
    const addressStr = contractAddress.toString();
    const cached = this.cache.get(addressStr);
    if (cached) {
      return cached;
    }

    const contract = await this.wallet.getContractInstance(contractAddress);
    if (!contract) {
      throw new AztecWalletError('contractInstanceNotRegistered', addressStr);
    }
    const artifact = await this.wallet.getContractArtifact(contract.contractClassId);
    if (!artifact) {
      throw new AztecWalletError('contractClassNotRegistered', contract.contractClassId.toString());
    }

    this.cache.set(addressStr, artifact);
    return artifact;
  }
}
