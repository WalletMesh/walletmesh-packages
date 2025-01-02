[**@walletmesh/router v0.2.0**](../README.md)

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

[packages/router/src/types.ts:148](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L148)

***

### chainId

> **chainId**: `string`

Target chain ID

#### Defined in

[packages/router/src/types.ts:144](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L144)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization

#### Defined in

[packages/router/src/types.ts:146](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L146)
