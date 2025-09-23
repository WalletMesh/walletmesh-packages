[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshChainSwitchButtonProps

# Interface: WalletMeshChainSwitchButtonProps

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:27](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L27)

Props for WalletMeshChainSwitchButton component

## Properties

### chainIcon?

> `optional` **chainIcon**: `string`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:33](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L33)

Optional icon URL for the chain

***

### chainName

> **chainName**: `string`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:31](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L31)

Display name for the chain

***

### className?

> `optional` **className**: `string`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:35](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L35)

Additional CSS class names

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:37](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L37)

Whether the button is disabled

***

### onChainSwitch()?

> `optional` **onChainSwitch**: (`chain`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:39](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L39)

Callback when chain switch is initiated

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

#### Returns

`void`

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:43](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L43)

Callback when chain switch fails

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`chain`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:41](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L41)

Callback when chain switch succeeds

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

#### Returns

`void`

***

### targetChain

> **targetChain**: `object`

Defined in: [core/modal-react/src/components/WalletMeshChainSwitchButton.tsx:29](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshChainSwitchButton.tsx#L29)

Target chain to switch to

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`
