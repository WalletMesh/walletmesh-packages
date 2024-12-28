[**@walletmesh/router v0.1.4**](../README.md)

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

[packages/router/src/types.ts:181](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L181)

***

### chainId

> **chainId**: `string`

Target chain ID

#### Defined in

[packages/router/src/types.ts:177](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L177)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization

#### Defined in

[packages/router/src/types.ts:179](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L179)
