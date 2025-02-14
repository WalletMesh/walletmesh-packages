[**@walletmesh/modal v0.0.5**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletInfo

# Interface: WalletInfo

Defined in: [core/modal/src/types.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L80)

Configuration for a supported wallet integration.

Defines how to connect to and interact with a specific wallet,
including its communication method and protocol adapter.

## Remarks

Security requirements:
- icon must be a data URI
- transport origin must be specified for PostMessage
- chain IDs should be validated

## Example

```typescript
const walletInfo: WalletInfo = {
  id: "my_wallet",
  name: "My Wallet",
  icon: "data:image/svg+xml,...",  // Must be data URI
  url: "https://wallet.example.com",
  supportedChains: ["aztec:testnet", "aztec:mainnet"],
  adapter: {
    type: "walletmesh_aztec",
    options: { chainId: "aztec:testnet" }
  },
  transport: {
    type: "postmessage",
    options: { origin: "https://wallet.example.com" }
  }
};
```

## Properties

### id

> **id**: `string`

Defined in: [core/modal/src/types.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L81)

Unique identifier for the wallet

***

### name

> **name**: `string`

Defined in: [core/modal/src/types.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L82)

User-friendly display name

***

### icon?

> `optional` **icon**: `string`

Defined in: [core/modal/src/types.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L83)

Optional data URI of wallet icon

***

### url?

> `optional` **url**: `string`

Defined in: [core/modal/src/types.ts:84](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L84)

Optional wallet website/install URL

***

### supportedChains?

> `optional` **supportedChains**: `string`[]

Defined in: [core/modal/src/types.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L85)

Optional list of supported chain IDs

***

### adapter

> **adapter**: [`AdapterConfig`](../../lib/adapters/types/type-aliases/AdapterConfig.md)

Defined in: [core/modal/src/types.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L86)

Chain-specific adapter configuration

***

### transport

> **transport**: [`TransportConfig`](../../lib/transports/types/interfaces/TransportConfig.md)

Defined in: [core/modal/src/types.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L87)

Communication transport configuration
