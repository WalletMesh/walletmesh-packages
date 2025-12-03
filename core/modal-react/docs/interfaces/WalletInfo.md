[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletInfo

# Interface: WalletInfo

Defined in: core/modal-core/dist/core/types.d.ts:91

Basic wallet information interface

## Remarks

Contains essential metadata about a wallet for display and connection purposes.
This information is used to render wallet options in the modal UI.

## Example

```typescript
const walletInfo: WalletInfo = {
  id: 'metamask',
  name: 'MetaMask',
  icon: 'https://example.com/metamask-icon.png',
  chains: [ChainType.Evm],
  description: 'Connect to the decentralized web',
  downloadUrl: 'https://metamask.io/download'
};
```

## Extended by

- [`DiscoveredWallet`](DiscoveredWallet.md)

## Properties

### chains

> **chains**: [`ChainType`](../enumerations/ChainType.md)[]

Defined in: core/modal-core/dist/core/types.d.ts:99

Array of blockchain types this wallet supports

***

### description?

> `optional` **description**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:101

Optional description of the wallet's features

***

### downloadUrl?

> `optional` **downloadUrl**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:103

URL where users can download/install the wallet

***

### features?

> `optional` **features**: `string`[]

Defined in: core/modal-core/dist/core/types.d.ts:105

Optional array of features supported by the wallet

***

### icon?

> `optional` **icon**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:97

URL or data URI of the wallet's icon for UI display

***

### id

> **id**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:93

Unique identifier for the wallet

***

### name

> **name**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:95

Display name of the wallet

***

### version?

> `optional` **version**: `string`

Defined in: core/modal-core/dist/core/types.d.ts:107

Optional version of the wallet
