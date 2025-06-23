[**@walletmesh/aztec-rpc-wallet v0.4.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / ContractArtifactCache

# Class: ContractArtifactCache

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/c22c9775e630bf48780e547c01c8f5442dc5b36c/aztec/rpc-wallet/src/contractArtifactCache.ts#L28)

Manages an in-memory cache for Aztec ContractArtifacts.

This class is designed to optimize performance by reducing redundant fetches
of contract artifacts. When an artifact is requested for a given contract address,
the cache first checks its local store. If the artifact is not found (a cache miss),
it uses the provided Wallet instance to retrieve the contract's metadata,
then its class metadata (which includes the artifact), stores it in the cache,
and finally returns it. Subsequent requests for the same artifact will be served
directly from the cache.

This caching strategy helps to:
- Minimize network requests to the PXE or node for contract data.
- Reduce processing overhead associated with fetching and parsing artifacts.
- Conserve memory by reusing already loaded artifact instances.

The cache is typically used within the `AztecHandlerContext` on the wallet-side
to provide efficient artifact access to RPC method handlers.

## See

 - [AztecHandlerContext](../interfaces/AztecHandlerContext.md)
 - Wallet
 - ContractArtifact

## Constructors

### Constructor

> **new ContractArtifactCache**(`wallet`): `ContractArtifactCache`

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/c22c9775e630bf48780e547c01c8f5442dc5b36c/aztec/rpc-wallet/src/contractArtifactCache.ts#L50)

Creates a new `ContractArtifactCache` instance.

#### Parameters

##### wallet

`Wallet`

The `aztec.js` Wallet instance that will be used to
                fetch contract metadata and artifacts if they are not found
                in the cache. This wallet should be capable of calling
                `getContractMetadata` and `getContractClassMetadata`.

#### Returns

`ContractArtifactCache`

## Methods

### getContractArtifact()

> **getContractArtifact**(`contractAddress`): `Promise`\<`ContractArtifact`\>

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/c22c9775e630bf48780e547c01c8f5442dc5b36c/aztec/rpc-wallet/src/contractArtifactCache.ts#L73)

Retrieves the ContractArtifact for a given AztecAddress.

This method implements a cache-aside pattern:
1. It first checks if the artifact for the `contractAddress` is already in the cache.
2. If found (cache hit), the cached artifact is returned immediately.
3. If not found (cache miss):
   a. It fetches the ContractMetadata for the `contractAddress` using the wallet.
   b. It then fetches the ContractClassMetadata using the class ID from the contract metadata.
      This class metadata is expected to contain the artifact.
   c. The retrieved artifact is stored in the cache, associated with the `contractAddress`.
   d. The artifact is then returned.

#### Parameters

##### contractAddress

`AztecAddress`

The AztecAddress of the contract whose artifact is to be retrieved.

#### Returns

`Promise`\<`ContractArtifact`\>

A promise that resolves to the ContractArtifact.

#### Throws

if the contract instance or its class (and thus artifact)
                           is not registered with the wallet or cannot be found.
                           Also re-throws other errors encountered during wallet calls.
