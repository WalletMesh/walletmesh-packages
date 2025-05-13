[**@walletmesh/aztec-rpc-wallet v0.3.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / TransactionParams

# Type Alias: TransactionParams

> **TransactionParams** = `object`

Defined in: [aztec/rpc-wallet/src/types.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L62)

Parameters for sending transactions.

## Properties

### authwits?

> `optional` **authwits**: `string`[]

Defined in: [aztec/rpc-wallet/src/types.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L66)

Optional array of authorization witnesses for the transaction

***

### functionCalls

> **functionCalls**: [`TransactionFunctionCall`](TransactionFunctionCall.md)[]

Defined in: [aztec/rpc-wallet/src/types.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L64)

Array of function calls to execute
