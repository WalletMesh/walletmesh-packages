[**@walletmesh/router v0.1.2**](../README.md)

***

[@walletmesh/router](../globals.md) / CallParams

# Interface: CallParams

Method invocation parameters
Parameters required to invoke a method on a specific chain through an authenticated session.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### call

> **call**: [`MethodCall`](MethodCall.md)

Calls

#### Defined in

[packages/router/src/types.ts:181](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/router/src/types.ts#L181)

***

### chainId

> **chainId**: `string`

Target chain ID

#### Defined in

[packages/router/src/types.ts:177](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/router/src/types.ts#L177)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization

#### Defined in

[packages/router/src/types.ts:179](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/router/src/types.ts#L179)
