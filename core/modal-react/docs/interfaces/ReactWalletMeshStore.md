[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ReactWalletMeshStore

# Interface: ReactWalletMeshStore

Defined in: [core/modal-react/src/types.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L113)

Core headless store interface
Framework-agnostic state management

## Methods

### dispatch()

> **dispatch**(`action`): `void`

Defined in: [core/modal-react/src/types.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L116)

#### Parameters

##### action

###### payload?

`unknown`

###### type

`string`

#### Returns

`void`

***

### getState()

> **getState**(): [`ReactWalletMeshState`](ReactWalletMeshState.md)

Defined in: [core/modal-react/src/types.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L114)

#### Returns

[`ReactWalletMeshState`](ReactWalletMeshState.md)

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Defined in: [core/modal-react/src/types.ts:115](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L115)

#### Parameters

##### listener

(`state`) => `void`

#### Returns

> (): `void`

##### Returns

`void`
