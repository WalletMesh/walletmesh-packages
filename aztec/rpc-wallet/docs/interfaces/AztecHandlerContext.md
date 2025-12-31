[**@walletmesh/aztec-rpc-wallet v0.5.6**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecHandlerContext

# Interface: AztecHandlerContext

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/wallet/handlers/index.ts#L26)

Defines the context object that is passed to all Aztec wallet JSON-RPC method handlers.
This context provides handlers with the necessary dependencies to perform their operations.
It extends the base [JSONRPCContext](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCContext.md) with Aztec-specific instances.

## Extends

- [`JSONRPCContext`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCContext.md)

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### cache

> **cache**: [`ContractArtifactCache`](../classes/ContractArtifactCache.md)

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/wallet/handlers/index.ts#L29)

An instance of [ContractArtifactCache](../classes/ContractArtifactCache.md) used for caching
                  contract artifacts to optimize performance.

***

### pxe

> **pxe**: `PXE`

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/wallet/handlers/index.ts#L28)

An instance of PXE (Private Execution Environment) client
                from `aztec.js`, used for interacting with the Aztec network.

***

### wallet

> **wallet**: [`AccountWallet`](https://docs.aztec.network/reference/aztec.js/interfaces/AccountWallet)

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/wallet/handlers/index.ts#L27)

An instance of [AccountWallet](https://docs.aztec.network/reference/aztec.js/interfaces/AccountWallet) from `aztec.js`,
                   representing the user's account and signing capabilities.

## Methods

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/wallet/handlers/index.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/wallet/handlers/index.ts#L30)

#### Type Parameters

##### M

`M` *extends* keyof [`AztecWalletMethodMap`](AztecWalletMethodMap.md)

#### Parameters

##### method

`M`

##### params

[`AztecWalletMethodMap`](AztecWalletMethodMap.md) & `AztecWalletNotificationMap`\[`M`\]\[`"params"`\]

#### Returns

`Promise`\<`void`\>
