[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseConfigReturn

# Interface: UseConfigReturn

Defined in: [core/modal-react/src/hooks/useConfig.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L20)

Hook return type for configuration and modal control

## Properties

### appDescription

> **appDescription**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L37)

Application description

***

### appIcon

> **appIcon**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L41)

Application icon URL

***

### appName

> **appName**: `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L35)

Application name

***

### appUrl

> **appUrl**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L39)

Application URL

***

### chains

> **chains**: `object`[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L43)

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

Defined in: [core/modal-react/src/hooks/useConfig.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L57)

Clear the current wallet filter

#### Returns

`void`

***

### client

> **client**: `null` \| [`WalletMeshClient`](WalletMeshClient.md)

Defined in: [core/modal-react/src/hooks/useConfig.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L23)

WalletMesh client instance

***

### close()

> **close**: () => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L31)

Close the wallet selection modal

#### Returns

`void`

***

### debug

> **debug**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L61)

Whether debug mode is enabled

***

### filteredWallets

> **filteredWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L53)

Filtered wallets based on current filter

***

### isOpen

> **isOpen**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L27)

Whether the modal is currently open

***

### open()

> **open**: (`options?`) => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L29)

Open the wallet selection modal

#### Parameters

##### options?

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

***

### setWalletFilter()

> **setWalletFilter**: (`filter`) => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L55)

Set a filter function to limit which wallets are shown

#### Parameters

##### filter

(`wallet`) => `boolean`

#### Returns

`void`

***

### walletFilter

> **walletFilter**: `null` \| (`wallet`) => `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L51)

Current wallet filter function

***

### wallets

> **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConfig.ts#L47)

Available wallets detected
