[**@walletmesh/aztec-rpc-wallet v0.3.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletBaseMethodMap

# Interface: AztecWalletBaseMethodMap

Defined in: [aztec/rpc-wallet/src/types.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L83)

A mapping of JSON-RPC methods to their parameters and return types for Aztec Wallets.

This extends the base WalletMethodMap with Aztec-specific methods.

## Extends

- `WalletMethodMap`

## Extended by

- [`AztecWalletMethodMap`](AztecWalletMethodMap.md)

## Indexable

\[`method`: `string`\]: `object`

## Properties

### aztec\_connect

> **aztec\_connect**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L88)

Connects to the Aztec network.

#### result

> **result**: `boolean`

#### Returns

A boolean indicating if the connection was successful

***

### aztec\_getAccount

> **aztec\_getAccount**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L94)

Gets the account address from the wallet.

#### result

> **result**: `string`

#### Returns

The account address as a string

***

### aztec\_sendTransaction

> **aztec\_sendTransaction**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L101)

Sends transactions to the Aztec network.

#### params

> **params**: [`TransactionParams`](../type-aliases/TransactionParams.md)

#### result

> **result**: `string`

#### Param

The transactions to execute and optional authorization witnesses

#### Returns

The transaction hash as a string

***

### aztec\_simulateTransaction

> **aztec\_simulateTransaction**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:111](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L111)

Simulates a transaction without executing it.

#### params

> **params**: [`TransactionFunctionCall`](../type-aliases/TransactionFunctionCall.md)

#### result

> **result**: `unknown`

#### Param

The transaction to simulate

#### Returns

The simulation result

***

### wm\_getSupportedMethods

> **wm\_getSupportedMethods**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L120)

Returns the list of supported methods for the wallet.

#### result

> **result**: `string`[]

#### Returns

An array of supported methods

#### Overrides

`WalletMethodMap.wm_getSupportedMethods`
