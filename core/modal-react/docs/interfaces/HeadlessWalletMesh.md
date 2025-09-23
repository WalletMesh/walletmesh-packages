[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / HeadlessWalletMesh

# Interface: HeadlessWalletMesh

Defined in: [core/modal-react/src/types.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L123)

Main headless WalletMesh interface
Pure business logic without UI concerns

## Properties

### \_client?

> `optional` **\_client**: `unknown`

Defined in: [core/modal-react/src/types.ts:145](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L145)

***

### actions

> **actions**: [`WalletMeshActions`](WalletMeshActions.md)

Defined in: [core/modal-react/src/types.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L128)

***

### providerVersion

> **providerVersion**: `number`

Defined in: [core/modal-react/src/types.ts:142](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L142)

***

### queries

> **queries**: [`WalletMeshQueries`](WalletMeshQueries.md)

Defined in: [core/modal-react/src/types.ts:131](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L131)

***

### store

> **store**: [`ReactWalletMeshStore`](ReactWalletMeshStore.md)

Defined in: [core/modal-react/src/types.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L125)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [core/modal-react/src/types.ts:139](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L139)

#### Returns

`void`

***

### emit()

> **emit**(`event`, `data`): `void`

Defined in: [core/modal-react/src/types.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L136)

#### Parameters

##### event

`string`

##### data

`unknown`

#### Returns

`void`

***

### off()

> **off**(`event`, `handler`): `void`

Defined in: [core/modal-react/src/types.ts:135](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L135)

#### Parameters

##### event

`string`

##### handler

(`data`) => `void`

#### Returns

`void`

***

### on()

> **on**(`event`, `handler`): () => `void`

Defined in: [core/modal-react/src/types.ts:134](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L134)

#### Parameters

##### event

`string`

##### handler

(`data`) => `void`

#### Returns

> (): `void`

##### Returns

`void`
