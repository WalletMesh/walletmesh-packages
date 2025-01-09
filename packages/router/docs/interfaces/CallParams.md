[**@walletmesh/router v0.2.5**](../README.md)

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

[packages/router/src/types.ts:274](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L274)

***

### chainId

> **chainId**: `string`

Target chain ID where the method will be executed

#### Defined in

[packages/router/src/types.ts:270](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L270)

***

### sessionId

> **sessionId**: `string`

Session ID for authorization and context

#### Defined in

[packages/router/src/types.ts:272](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L272)
