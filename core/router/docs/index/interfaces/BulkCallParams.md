[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / BulkCallParams

# Interface: BulkCallParams

Defined in: [core/router/src/types.ts:293](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L293)

Parameters for executing multiple method calls in sequence on a specific chain.
Used with the wm_bulkCall method to batch multiple operations efficiently.
All calls in the sequence must be permitted for the operation to succeed.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### calls

> **calls**: [`MethodCall`](MethodCall.md)[]

Defined in: [core/router/src/types.ts:299](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L299)

Array of method calls to execute in sequence

***

### chainId

> **chainId**: `string`

Defined in: [core/router/src/types.ts:295](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L295)

Target chain ID where the methods will be executed

***

### sessionId

> **sessionId**: `string`

Defined in: [core/router/src/types.ts:297](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L297)

Session ID for authorization and context
