[**@walletmesh/modal v0.0.7**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletInfo

# Interface: WalletInfo

Defined in: [core/modal/src/types.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L73)

Configuration for a supported wallet integration.

Defines how to connect to and interact with a specific wallet.
Each wallet implementation manages its own communication transport internally.

## Remarks

Security requirements:
- icon must be a data URI
- chain IDs should be validated

## Example

```typescript
const walletInfo: WalletInfo = {
  id: "my_wallet",
  name: "My Wallet",
  icon: "data:image/svg+xml,...",  // Must be data URI
  url: "https://wallet.example.com",
  supportedChains: ["aztec:testnet", "aztec:mainnet"],
  connector: {
    type: "walletmesh_aztec",
    options: { chainId: "aztec:testnet" }
  }
};
```

## Properties

### id

> **id**: `string`

Defined in: [core/modal/src/types.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L74)

Unique identifier for the wallet

***

### name

> **name**: `string`

Defined in: [core/modal/src/types.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L75)

User-friendly display name

***

### iconDataUri?

> `optional` **iconDataUri**: `string`

Defined in: [core/modal/src/types.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L76)

***

### websiteUrl?

> `optional` **websiteUrl**: `string`

Defined in: [core/modal/src/types.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L77)

***

### supportedChains?

> `optional` **supportedChains**: `string`[]

Defined in: [core/modal/src/types.ts:78](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L78)

Optional list of supported chain IDs

***

### connector

> **connector**: [`WalletConnectorConfig`](../../lib/connectors/types/interfaces/WalletConnectorConfig.md)

Defined in: [core/modal/src/types.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L79)

Chain-specific connector configuration
