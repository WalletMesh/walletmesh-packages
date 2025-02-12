[**@walletmesh/aztec-rpc-wallet v0.3.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / TransactionParams

# Type Alias: TransactionParams

> **TransactionParams**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/65bc501d5bed45d0e6d444f53e29595da551d59e/aztec/rpc-wallet/src/types.ts#L62)

Parameters for sending transactions.

## Type declaration

### authwits?

> `optional` **authwits**: `string`[]

Optional array of authorization witnesses for the transaction

### functionCalls

> **functionCalls**: [`TransactionFunctionCall`](TransactionFunctionCall.md)[]

Array of function calls to execute
