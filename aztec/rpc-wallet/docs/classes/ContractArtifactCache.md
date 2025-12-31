[**@walletmesh/aztec-rpc-wallet v0.5.6**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / ContractArtifactCache

# Class: ContractArtifactCache

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/contractArtifactCache.ts#L30)

Manages an in-memory cache for Aztec ContractArtifacts.

This class is designed to optimize performance by reducing redundant fetches
of contract artifacts. When an artifact is requested for a given contract address,
the cache first checks its local store. If the artifact is not found (a cache miss),
it uses the provided [Wallet](https://docs.aztec.network/reference/aztec.js/interfaces/Wallet) instance to retrieve the contract's metadata,
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
 - [Wallet](https://docs.aztec.network/reference/aztec.js/interfaces/Wallet)
 - ContractArtifact

## Constructors

### Constructor

> **new ContractArtifactCache**(`wallet`): `ContractArtifactCache`

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/contractArtifactCache.ts#L52)

Creates a new `ContractArtifactCache` instance.

#### Parameters

##### wallet

[`Wallet`](https://docs.aztec.network/reference/aztec.js/interfaces/Wallet)

The `aztec.js` [Wallet](https://docs.aztec.network/reference/aztec.js/interfaces/Wallet) instance that will be used to
                fetch contract metadata and artifacts if they are not found
                in the cache. This wallet should be capable of calling
                `getContractMetadata` and `getContractClassMetadata`.

#### Returns

`ContractArtifactCache`

## Methods

### getContractArtifact()

> **getContractArtifact**(`contractAddress`): `Promise`\<`ContractArtifact`\>

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/contractArtifactCache.ts#L91)

#### Parameters

##### contractAddress

`AztecAddress`

#### Returns

`Promise`\<`ContractArtifact`\>

***

### rememberContractClass()

> **rememberContractClass**(`artifact`): `Promise`\<`string`\>

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/contractArtifactCache.ts#L86)

#### Parameters

##### artifact

`ContractArtifact`

#### Returns

`Promise`\<`string`\>

***

### storeArtifactForAddress()

> **storeArtifactForAddress**(`address`, `artifact`): `void`

Defined in: [aztec/rpc-wallet/src/contractArtifactCache.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/contractArtifactCache.ts#L82)

#### Parameters

##### address

`AztecAddress`

##### artifact

`ContractArtifact`

#### Returns

`void`
