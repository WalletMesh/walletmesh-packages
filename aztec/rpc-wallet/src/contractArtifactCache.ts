import type { AztecAddress, ContractArtifact, Wallet } from '@aztec/aztec.js';
import { Fr } from '@aztec/foundation/fields';
import { getContractClassFromArtifact } from '@aztec/stdlib/contract';

import { AztecWalletError } from './errors.js';

/**
 * Manages an in-memory cache for Aztec {@link ContractArtifact}s.
 *
 * This class is designed to optimize performance by reducing redundant fetches
 * of contract artifacts. When an artifact is requested for a given contract address,
 * the cache first checks its local store. If the artifact is not found (a cache miss),
 * it uses the provided {@link Wallet} instance to retrieve the contract's metadata,
 * then its class metadata (which includes the artifact), stores it in the cache,
 * and finally returns it. Subsequent requests for the same artifact will be served
 * directly from the cache.
 *
 * This caching strategy helps to:
 * - Minimize network requests to the PXE or node for contract data.
 * - Reduce processing overhead associated with fetching and parsing artifacts.
 * - Conserve memory by reusing already loaded artifact instances.
 *
 * The cache is typically used within the `AztecHandlerContext` on the wallet-side
 * to provide efficient artifact access to RPC method handlers.
 *
 * @see {@link AztecHandlerContext}
 * @see {@link Wallet}
 * @see {@link ContractArtifact}
 */
export class ContractArtifactCache {
  /**
   * In-memory map storing contract artifacts, keyed by their stringified {@link AztecAddress}.
   * @internal
   */
  private cache = new Map<string, ContractArtifact>();

  /**
   * Reference to the `aztec.js` {@link Wallet} instance used to fetch contract
   * metadata and artifacts in case of a cache miss.
   * @internal
   */
  private wallet: Wallet;

  /**
   * Creates a new `ContractArtifactCache` instance.
   *
   * @param wallet - The `aztec.js` {@link Wallet} instance that will be used to
   *                 fetch contract metadata and artifacts if they are not found
   *                 in the cache. This wallet should be capable of calling
   *                 `getContractMetadata` and `getContractClassMetadata`.
   */
  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  /**
   * Retrieves the {@link ContractArtifact} for a given {@link AztecAddress}.
   *
   * This method implements a cache-aside pattern:
   * 1. It first checks if the artifact for the `contractAddress` is already in the cache.
   * 2. If found (cache hit), the cached artifact is returned immediately.
   * 3. If not found (cache miss):
   *    a. It fetches the {@link ContractMetadata} for the `contractAddress` using the wallet.
   *    b. It then fetches the {@link ContractClassMetadata} using the class ID from the contract metadata.
   *       This class metadata is expected to contain the artifact.
   *    c. The retrieved artifact is stored in the cache, associated with the `contractAddress`.
   *    d. The artifact is then returned.
   *
   * @param contractAddress - The {@link AztecAddress} of the contract whose artifact is to be retrieved.
   * @returns A promise that resolves to the {@link ContractArtifact}.
   * @throws {AztecWalletError} if the contract instance or its class (and thus artifact)
   *                            is not registered with the wallet or cannot be found.
   *                            Also re-throws other errors encountered during wallet calls.
   */
  private toKey(identifier: AztecAddress | Fr | string): string {
    if (typeof identifier === 'string') {
      return identifier;
    }
    return identifier.toString();
  }

  public storeArtifactForAddress(address: AztecAddress, artifact: ContractArtifact): void {
    this.cache.set(address.toString(), artifact);
  }

  public async rememberContractClass(artifact: ContractArtifact): Promise<string> {
    const { artifactHash } = await getContractClassFromArtifact(artifact);
    return this.toKey(artifactHash);
  }

  public async getContractArtifact(contractAddress: AztecAddress): Promise<ContractArtifact> {
    const addressStr = contractAddress.toString();
    const cached = this.cache.get(addressStr);
    if (cached) {
      return cached;
    }

    try {
      const contractMetadata = await this.wallet.getContractMetadata(contractAddress);
      const contract = contractMetadata.contractInstance;
      if (!contract) {
        throw new AztecWalletError('contractInstanceNotRegistered', addressStr);
      }

      const contractClassMetadata = await this.wallet.getContractClassMetadata(
        contract.currentContractClassId,
      );
      const artifact = contractClassMetadata.artifact;
      if (!artifact) {
        throw new AztecWalletError('contractClassNotRegistered', contract.currentContractClassId.toString());
      }
      this.cache.set(addressStr, artifact);
      return artifact;
    } catch (error) {
      if (error instanceof AztecWalletError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AztecWalletError('contractInstanceNotRegistered', `${addressStr}: ${errorMessage}`);
    }
  }
}
