[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ChainCapability

# Interface: ChainCapability

Defined in: [core/types.ts:751](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L751)

Comprehensive blockchain capability information.

Defines all capabilities a wallet supports for a specific blockchain,
including transaction types, signature schemes, and advanced features.
This enables precise capability matching during discovery.

## Example

```typescript
const capability: ChainCapability = {
  chainId: 'eip155:1',
  chainType: 'evm',
  network: {
    name: 'Ethereum Mainnet',
    chainId: 'eip155:1',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false
  },
  standards: ['eip-1193', 'eip-6963'], // Provider interfaces
  rpcMethods: ['eth_accounts', 'eth_sendTransaction'],
  transactionTypes: [{
    id: 'transfer',
    name: 'Token Transfer',
    chainTypes: ['evm'],
    parameters: []
  }],
  signatureSchemes: ['secp256k1'],
  features: [{
    id: 'smart-contracts',
    name: 'Smart Contract Interaction'
  }]
};
```

## Since

0.1.0

## See

 - [ResponderInfo](../type-aliases/ResponderInfo.md) for responder-level capabilities
 - [CapabilityMatcher](../classes/CapabilityMatcher.md) for matching logic

## Properties

### chainId

> **chainId**: `string`

Defined in: [core/types.ts:753](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L753)

***

### chainType

> **chainType**: [`ChainType`](../type-aliases/ChainType.md)

Defined in: [core/types.ts:754](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L754)

***

### extensions?

> `optional` **extensions**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:767](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L767)

***

### features

> **features**: [`ChainFeature`](ChainFeature.md)[]

Defined in: [core/types.ts:766](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L766)

***

### network

> **network**: [`NetworkInfo`](NetworkInfo.md)

Defined in: [core/types.ts:755](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L755)

***

### rpcMethods

> **rpcMethods**: `string`[]

Defined in: [core/types.ts:759](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L759)

***

### signatureSchemes

> **signatureSchemes**: `string`[]

Defined in: [core/types.ts:763](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L763)

***

### standards

> **standards**: `string`[]

Defined in: [core/types.ts:758](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L758)

***

### transactionTypes

> **transactionTypes**: [`TransactionType`](TransactionType.md)[]

Defined in: [core/types.ts:762](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L762)
