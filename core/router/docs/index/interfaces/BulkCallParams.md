[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / BulkCallParams

# Interface: BulkCallParams

Defined in: [core/router/src/types.ts:270](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L270)

Parameters for executing multiple method calls in sequence on a specific chain.
Used with the wm_bulkCall method to batch multiple operations efficiently.
All calls in the sequence must be permitted for the operation to succeed.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### calls

> **calls**: [`MethodCall`](MethodCall.md)\<keyof [`RouterMethodMap`](RouterMethodMap.md)\>[]

Defined in: [core/router/src/types.ts:276](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L276)

Array of method calls to execute in sequence

***

### chainId

> **chainId**: `string`

Defined in: [core/router/src/types.ts:272](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L272)

Target chain ID where the methods will be executed

***

### sessionId

> **sessionId**: `string`

Defined in: [core/router/src/types.ts:274](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L274)

Session ID for authorization and context
