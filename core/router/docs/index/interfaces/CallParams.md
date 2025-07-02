[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / CallParams

# Interface: CallParams

Defined in: [core/router/src/types.ts:252](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L252)

Parameters required to invoke a single method on a specific chain.
Used with the wm_call method to execute wallet operations.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### call

> **call**: [`MethodCall`](MethodCall.md)

Defined in: [core/router/src/types.ts:258](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L258)

Method call details including name and parameters

***

### chainId

> **chainId**: `string`

Defined in: [core/router/src/types.ts:254](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L254)

Target chain ID where the method will be executed

***

### sessionId

> **sessionId**: `string`

Defined in: [core/router/src/types.ts:256](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L256)

Session ID for authorization and context
