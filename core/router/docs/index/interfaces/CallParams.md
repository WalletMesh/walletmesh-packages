[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / CallParams

# Interface: CallParams

Defined in: [core/router/src/types.ts:256](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L256)

Parameters required to invoke a single method on a specific chain.
Used with the wm_call method to execute wallet operations.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### call

> **call**: [`MethodCall`](MethodCall.md)

Defined in: [core/router/src/types.ts:262](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L262)

Method call details including name and parameters

***

### chainId

> **chainId**: `string`

Defined in: [core/router/src/types.ts:258](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L258)

Target chain ID where the method will be executed

***

### sessionId

> **sessionId**: `string`

Defined in: [core/router/src/types.ts:260](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L260)

Session ID for authorization and context
