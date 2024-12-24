[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / CallParams

# Interface: CallParams

Method invocation parameters
Parameters required to invoke a method on a specific chain through an authenticated session.

## Hierarchy

- `Record`\<`string`, `unknown`\>

  ↳ **`CallParams`**

## Table of contents

### Properties

- [call](CallParams.md#call)
- [chainId](CallParams.md#chainid)
- [sessionId](CallParams.md#sessionid)

## Properties

### call

• **call**: [`MethodCall`](MethodCall.md)

Calls

#### Defined in

[packages/router/src/types.ts:136](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L136)

___

### chainId

• **chainId**: `string`

Target chain ID

#### Defined in

[packages/router/src/types.ts:132](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L132)

___

### sessionId

• **sessionId**: `string`

Session ID for authorization

#### Defined in

[packages/router/src/types.ts:134](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L134)
