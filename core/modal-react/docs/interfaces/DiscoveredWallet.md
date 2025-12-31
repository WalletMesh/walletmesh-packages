[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DiscoveredWallet

# Interface: DiscoveredWallet

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:97

Discovered wallet information with extended metadata

## Extends

- [`WalletInfo`](WalletInfo.md)

## Properties

### chains

> **chains**: [`ChainType`](../enumerations/ChainType.md)[]

Defined in: core/modal-core/dist/core/types.d.ts:99

Array of blockchain types this wallet supports

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`chains`](WalletInfo.md#chains)

***

### description?

> `optional` **description**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:101

Optional description of the wallet's features

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`description`](WalletInfo.md#description)

***

### discoveredAt

> **discoveredAt**: `number`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:107

Discovery timestamp

***

### discoveryMethod

> **discoveryMethod**: `"manual"` \| `"extension"` \| `"injected"` \| `"announced"` \| `"discovery-protocol"`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:99

Discovery method used

***

### downloadUrl?

> `optional` **downloadUrl**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:103

URL where users can download/install the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`downloadUrl`](WalletInfo.md#downloadurl)

***

### features?

> `optional` **features**: `string`[]

Defined in: core/modal-core/dist/core/types.d.ts:105

Optional array of features supported by the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`features`](WalletInfo.md#features)

***

### icon?

> `optional` **icon**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:97

URL or data URI of the wallet's icon for UI display

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`icon`](WalletInfo.md#icon)

***

### id

> **id**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:93

Unique identifier for the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`id`](WalletInfo.md#id)

***

### isAvailable

> **isAvailable**: `boolean`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:101

Wallet availability status

***

### lastSeen

> **lastSeen**: `number`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:109

Last seen timestamp

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:105

Additional metadata from discovery

***

### name

> **name**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:95

Display name of the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`name`](WalletInfo.md#name)

***

### version?

> `optional` **version**: `string`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:103

Wallet version if available

#### Overrides

[`WalletInfo`](WalletInfo.md).[`version`](WalletInfo.md#version)
