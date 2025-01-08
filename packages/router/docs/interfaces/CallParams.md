[**@walletmesh/router v0.2.3**](../README.md)

***

[@walletmesh/router](../globals.md) / CallParams

# Interface: CallParams

Parameters required to invoke a single method on a specific chain.
Used with the wm_call method to execute wallet operations.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### call

> **call**: [`MethodCall`](MethodCall.md)

Method call details including name and parameters

#### Defined in

[packages/router/src/types.ts:268](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L268)

***

### chainId

> **chainId**: `string`

Target chain ID where the method will be executed

#### Defined in

[packages/router/src/types.ts:264](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L264)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization and context

#### Defined in

[packages/router/src/types.ts:266](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L266)
