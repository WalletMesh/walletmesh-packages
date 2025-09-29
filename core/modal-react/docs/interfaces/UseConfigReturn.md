[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseConfigReturn

# Interface: UseConfigReturn

Defined in: [core/modal-react/src/hooks/useConfig.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L24)

Hook return type for configuration and modal control

## Properties

### appDescription

> **appDescription**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L41)

Application description

***

### appIcon

> **appIcon**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L45)

Application icon URL

***

### appName

> **appName**: `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L39)

Application name

***

### appUrl

> **appUrl**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L43)

Application URL

***

### chains

> **chains**: `object`[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L47)

Supported chains

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

***

### clearWalletFilter()

> **clearWalletFilter**: () => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L65)

Clear the current wallet filter

#### Returns

`void`

***

### client

> **client**: `null` \| `WalletMeshClient`

Defined in: [core/modal-react/src/hooks/useConfig.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L27)

WalletMesh client instance

***

### close()

> **close**: () => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L35)

Close the wallet selection modal

#### Returns

`void`

***

### debug

> **debug**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L69)

Whether debug mode is enabled

***

### filteredWallets

> **filteredWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L61)

Filtered wallets based on current filter

***

### isDiscovering

> **isDiscovering**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L53)

Whether wallet discovery is in progress

***

### isOpen

> **isOpen**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L31)

Whether the modal is currently open

***

### open()

> **open**: (`options?`) => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L33)

Open the wallet selection modal

#### Parameters

##### options?

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

***

### refreshWallets()

> **refreshWallets**: (`options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useConfig.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L55)

Refresh available wallets

#### Parameters

##### options?

[`RefreshWalletsOptions`](../interfaces/RefreshWalletsOptions.md)

#### Returns

`Promise`\<`void`\>

***

### setWalletFilter()

> **setWalletFilter**: (`filter`) => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L63)

Set a filter function to limit which wallets are shown

#### Parameters

##### filter

(`wallet`) => `boolean`

#### Returns

`void`

***

### walletFilter

> **walletFilter**: `null` \| (`wallet`) => `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L59)

Current wallet filter function

***

### wallets

> **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConfig.ts#L51)

Available wallets detected
