[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletInfo

# Interface: WalletInfo

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

Array of blockchain types this wallet supports

***

### description?

> `optional` **description**: `string`

Optional description of the wallet's features

***

### downloadUrl?

> `optional` **downloadUrl**: `string`

URL where users can download/install the wallet

***

### features?

> `optional` **features**: `string`[]

Optional array of features supported by the wallet

***

### icon?

> `optional` **icon**: `string`

URL or data URI of the wallet's icon for UI display

***

### id

> **id**: `string`

Unique identifier for the wallet

***

### name

> **name**: `string`

Display name of the wallet

***

### version?

> `optional` **version**: `string`

Optional version of the wallet
