[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / CallParams

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

[packages/router/src/types.ts:181](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L181)

___

### chainId

• **chainId**: `string`

Target chain ID

#### Defined in

[packages/router/src/types.ts:177](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L177)

___

### sessionId

• **sessionId**: `string`

Session ID for authorization

#### Defined in

[packages/router/src/types.ts:179](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L179)
