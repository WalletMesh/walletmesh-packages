[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseConfigReturn

# Interface: UseConfigReturn

Defined in: [core/modal-react/src/hooks/useConfig.ts:129](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L129)

## Properties

### appDescription

> **appDescription**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:146](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L146)

Application description

***

### appIcon

> **appIcon**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:150](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L150)

Application icon URL

***

### appName

> **appName**: `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:144](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L144)

Application name

***

### appUrl

> **appUrl**: `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useConfig.ts:148](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L148)

Application URL

***

### chains

> **chains**: `object`[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:152](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L152)

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

Defined in: [core/modal-react/src/hooks/useConfig.ts:170](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L170)

Clear the current wallet filter

#### Returns

`void`

***

### client

> **client**: `null` \| [`WalletMeshClient`](WalletMeshClient.md)

Defined in: [core/modal-react/src/hooks/useConfig.ts:132](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L132)

WalletMesh client instance

***

### close()

> **close**: () => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:140](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L140)

Close the wallet selection modal

#### Returns

`void`

***

### debug

> **debug**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:174](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L174)

Whether debug mode is enabled

***

### filteredWallets

> **filteredWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:166](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L166)

Filtered wallets based on current filter

***

### isDiscovering

> **isDiscovering**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L158)

Whether wallet discovery is in progress

***

### isOpen

> **isOpen**: `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L136)

Whether the modal is currently open

***

### open()

> **open**: (`options?`) => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L138)

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

Defined in: [core/modal-react/src/hooks/useConfig.ts:160](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L160)

Refresh available wallets

#### Parameters

##### options?

[`RefreshWalletsOptions`](RefreshWalletsOptions.md)

#### Returns

`Promise`\<`void`\>

***

### setWalletFilter()

> **setWalletFilter**: (`filter`) => `void`

Defined in: [core/modal-react/src/hooks/useConfig.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L168)

Set a filter function to limit which wallets are shown

#### Parameters

##### filter

(`wallet`) => `boolean`

#### Returns

`void`

***

### walletFilter

> **walletFilter**: `null` \| (`wallet`) => `boolean`

Defined in: [core/modal-react/src/hooks/useConfig.ts:164](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L164)

Current wallet filter function

***

### wallets

> **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/hooks/useConfig.ts:156](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConfig.ts#L156)

Available wallets detected
