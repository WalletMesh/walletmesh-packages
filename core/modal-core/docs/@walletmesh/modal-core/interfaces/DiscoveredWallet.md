[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveredWallet

# Interface: DiscoveredWallet

Discovered wallet information with extended metadata

## Extends

- [`WalletInfo`](WalletInfo.md)

## Properties

### chains

> **chains**: [`ChainType`](../enumerations/ChainType.md)[]

Array of blockchain types this wallet supports

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`chains`](WalletInfo.md#chains)

***

### description?

> `optional` **description**: `string`

Optional description of the wallet's features

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`description`](WalletInfo.md#description)

***

### discoveredAt

> **discoveredAt**: `number`

Discovery timestamp

***

### discoveryMethod

> **discoveryMethod**: `"extension"` \| `"injected"` \| `"manual"` \| `"announced"`

Discovery method used

***

### downloadUrl?

> `optional` **downloadUrl**: `string`

URL where users can download/install the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`downloadUrl`](WalletInfo.md#downloadurl)

***

### features?

> `optional` **features**: `string`[]

Optional array of features supported by the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`features`](WalletInfo.md#features)

***

### icon?

> `optional` **icon**: `string`

URL or data URI of the wallet's icon for UI display

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`icon`](WalletInfo.md#icon)

***

### id

> **id**: `string`

Unique identifier for the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`id`](WalletInfo.md#id)

***

### isAvailable

> **isAvailable**: `boolean`

Wallet availability status

***

### lastSeen

> **lastSeen**: `number`

Last seen timestamp

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Additional metadata from discovery

***

### name

> **name**: `string`

Display name of the wallet

#### Inherited from

[`WalletInfo`](WalletInfo.md).[`name`](WalletInfo.md#name)

***

### version?

> `optional` **version**: `string`

Wallet version if available

#### Overrides

[`WalletInfo`](WalletInfo.md).[`version`](WalletInfo.md#version)
