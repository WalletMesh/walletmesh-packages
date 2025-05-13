[**@walletmesh/aztec-rpc-wallet v0.3.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletMethodHandler

# Type Alias: AztecWalletMethodHandler()\<T, M, C\>

> **AztecWalletMethodHandler**\<`T`, `M`, `C`\> = (`context`, `params`, `accountWallet`) => `Promise`\<`T`\[`M`\]\[`"result"`\]\> \| `T`\[`M`\]\[`"result"`\]

Defined in: [aztec/rpc-wallet/src/types.ts:286](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/types.ts#L286)

## Type Parameters

### T

`T` *extends* [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

### M

`M` *extends* keyof `T`

### C

`C` *extends* [`AztecWalletContext`](AztecWalletContext.md)

## Parameters

### context

`C`

### params

`T`\[`M`\]\[`"params"`\]

### accountWallet

`AccountWallet`

## Returns

`Promise`\<`T`\[`M`\]\[`"result"`\]\> \| `T`\[`M`\]\[`"result"`\]
