[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / BulkCallParams

# Interface: BulkCallParams

Defined in: [core/router/src/types.ts:266](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L266)

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

Defined in: [core/router/src/types.ts:272](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L272)

Array of method calls to execute in sequence

***

### chainId

> **chainId**: `string`

Defined in: [core/router/src/types.ts:268](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L268)

Target chain ID where the methods will be executed

***

### sessionId

> **sessionId**: `string`

Defined in: [core/router/src/types.ts:270](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L270)

Session ID for authorization and context
