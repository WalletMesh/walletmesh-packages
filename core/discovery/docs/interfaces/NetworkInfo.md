[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / NetworkInfo

# Interface: NetworkInfo

Defined in: [core/types.ts:512](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L512)

Network information for a blockchain network.

Contains essential network metadata including native currency,
RPC endpoints, and block explorer URLs for wallet integration.

## Example

```typescript
const network: NetworkInfo = {
  name: 'Ethereum Mainnet',
  chainId: 'eip155:1',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://ethereum.publicnode.com'],
  blockExplorerUrls: ['https://etherscan.io'],
  testnet: false
};
```

## Since

0.1.0

## See

[ChainCapability](ChainCapability.md) for full chain capabilities

## Properties

### blockExplorerUrls?

> `optional` **blockExplorerUrls**: `string`[]

Defined in: [core/types.ts:521](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L521)

***

### chainId

> **chainId**: `string`

Defined in: [core/types.ts:514](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L514)

***

### name

> **name**: `string`

Defined in: [core/types.ts:513](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L513)

***

### nativeCurrency

> **nativeCurrency**: `object`

Defined in: [core/types.ts:515](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L515)

#### decimals

> **decimals**: `number`

#### name

> **name**: `string`

#### symbol

> **symbol**: `string`

***

### rpcUrls?

> `optional` **rpcUrls**: `string`[]

Defined in: [core/types.ts:520](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L520)

***

### testnet

> **testnet**: `boolean`

Defined in: [core/types.ts:522](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L522)
