[**@walletmesh/router v0.2.1**](../README.md)

***

[@walletmesh/router](../globals.md) / BulkCallParams

# Interface: BulkCallParams

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

Array of method calls to execute in sequence

#### Defined in

[packages/router/src/types.ts:282](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/router/src/types.ts#L282)

***

### chainId

> **chainId**: `string`

Target chain ID where the methods will be executed

#### Defined in

[packages/router/src/types.ts:278](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/router/src/types.ts#L278)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization and context

#### Defined in

[packages/router/src/types.ts:280](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/router/src/types.ts#L280)
