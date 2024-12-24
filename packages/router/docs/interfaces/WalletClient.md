[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / WalletClient

# Interface: WalletClient

Interface for wallet clients that can be used with the router

## Implemented by

- [`JSONRPCWalletClient`](../classes/JSONRPCWalletClient.md)

## Table of contents

### Methods

- [call](WalletClient.md#call)
- [getSupportedMethods](WalletClient.md#getsupportedmethods)

## Methods

### call

▸ **call**\<`T`\>(`method`, `params?`): `Promise`\<`T`\>

Call a method on the wallet

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `string` | Method name to invoke |
| `params?` | `unknown` | Method parameters |

#### Returns

`Promise`\<`T`\>

Promise resolving to the method result

#### Defined in

[packages/router/src/types.ts:11](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L11)

___

### getSupportedMethods

▸ **getSupportedMethods**(): `Promise`\<\{ `methods`: `string`[]  }\>

Get supported capabilities

#### Returns

`Promise`\<\{ `methods`: `string`[]  }\>

Promise resolving to object containing supported methods

#### Defined in

[packages/router/src/types.ts:17](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L17)
