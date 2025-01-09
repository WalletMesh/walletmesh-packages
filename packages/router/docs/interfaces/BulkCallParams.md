[**@walletmesh/router v0.2.4**](../README.md)

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

[packages/router/src/types.ts:288](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L288)

***

### chainId

> **chainId**: `string`

Target chain ID where the methods will be executed

#### Defined in

[packages/router/src/types.ts:284](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L284)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization and context

#### Defined in

[packages/router/src/types.ts:286](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L286)
