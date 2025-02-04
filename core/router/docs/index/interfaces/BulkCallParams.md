[**@walletmesh/router v0.2.7**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / BulkCallParams

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

[packages/router/src/types.ts:299](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/types.ts#L299)

***

### chainId

> **chainId**: `string`

Target chain ID where the methods will be executed

#### Defined in

[packages/router/src/types.ts:295](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/types.ts#L295)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization and context

#### Defined in

[packages/router/src/types.ts:297](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/types.ts#L297)
