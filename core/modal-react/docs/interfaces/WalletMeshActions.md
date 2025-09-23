[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshActions

# Interface: WalletMeshActions

Defined in: [core/modal-react/src/types.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L71)

Headless WalletMesh actions interface
Pure actions without UI side effects

## Methods

### cancelConnection()

> **cancelConnection**(): `void`

Defined in: [core/modal-react/src/types.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L75)

#### Returns

`void`

***

### closeModal()

> **closeModal**(): `void`

Defined in: [core/modal-react/src/types.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L92)

#### Returns

`void`

***

### disconnect()

> **disconnect**(`walletId?`): `void`

Defined in: [core/modal-react/src/types.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L76)

#### Parameters

##### walletId?

`string`

#### Returns

`void`

***

### openModal()

> **openModal**(): `void`

Defined in: [core/modal-react/src/types.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L91)

#### Returns

`void`

***

### requestConnection()

> **requestConnection**(): `void`

Defined in: [core/modal-react/src/types.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L73)

#### Returns

`void`

***

### retry()

> **retry**(): `void`

Defined in: [core/modal-react/src/types.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L77)

#### Returns

`void`

***

### selectWallet()

> **selectWallet**(`walletId`): `void` \| `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L74)

#### Parameters

##### walletId

`string`

#### Returns

`void` \| `Promise`\<`void`\>

***

### setView()

> **setView**(`view`): `void`

Defined in: [core/modal-react/src/types.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L93)

#### Parameters

##### view

`"walletSelection"` | `"connecting"` | `"connected"` | `"error"` | `"switchingChain"`

#### Returns

`void`

***

### switchChain()

> **switchChain**(`chain`, `walletId?`): `Promise`\<\{ `chain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `chainType`: `string`; `previousChain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `provider`: `unknown`; \}\>

Defined in: [core/modal-react/src/types.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L80)

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### walletId?

`string`

#### Returns

`Promise`\<\{ `chain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `chainType`: `string`; `previousChain`: \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}; `provider`: `unknown`; \}\>
