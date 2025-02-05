[**@walletmesh/aztec-rpc-wallet v0.3.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / TransactionParams

# Type Alias: TransactionParams

> **TransactionParams**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/types.ts#L62)

Parameters for sending transactions.

## Type declaration

### authwits?

> `optional` **authwits**: `string`[]

Optional array of authorization witnesses for the transaction

### functionCalls

> **functionCalls**: [`TransactionFunctionCall`](TransactionFunctionCall.md)[]

Array of function calls to execute
