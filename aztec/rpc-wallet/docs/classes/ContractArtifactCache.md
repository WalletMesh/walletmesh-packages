[**@walletmesh/aztec-rpc-wallet v0.3.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / ContractArtifactCache

# Class: ContractArtifactCache

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/contractArtifactCache.ts#L27)

Caches contract artifacts to optimize contract interactions.

This class maintains an in-memory cache of contract artifacts indexed by contract address.
When a contract artifact is requested:
1. First checks the cache for an existing artifact
2. If not found, fetches the contract instance and its artifact from the wallet
3. Stores the artifact in the cache for future use
4. Returns the artifact to the caller

This caching mechanism helps reduce:
- Network requests to fetch contract data
- Processing overhead of parsing contract artifacts
- Memory usage by reusing existing artifacts

## Constructors

### new ContractArtifactCache()

> **new ContractArtifactCache**(`wallet`): [`ContractArtifactCache`](ContractArtifactCache.md)

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/contractArtifactCache.ts#L37)

Creates a new ContractArtifactCache instance.

#### Parameters

##### wallet

`Wallet`

Wallet instance used to fetch contract data when cache misses occur

#### Returns

[`ContractArtifactCache`](ContractArtifactCache.md)

## Methods

### getContractArtifact()

> **getContractArtifact**(`contractAddress`): `Promise`\<`ContractArtifact`\>

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/contractArtifactCache.ts#L56)

Retrieves the contract artifact for a given contract address.
First checks the cache, then falls back to fetching from the wallet if needed.

The process:
1. Check if artifact exists in cache
2. If not, get contract instance from wallet
3. Use instance to get contract class ID
4. Fetch artifact using class ID
5. Cache the artifact for future use

#### Parameters

##### contractAddress

`AztecAddress`

The contract address to retrieve the artifact for

#### Returns

`Promise`\<`ContractArtifact`\>

Promise resolving to the contract artifact

#### Throws

If contract instance or class not registered
