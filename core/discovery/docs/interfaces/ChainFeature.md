[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ChainFeature

# Interface: ChainFeature

Defined in: [core/types.ts:705](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L705)

Chain-specific feature definition for advanced blockchain capabilities.

Describes optional features that a wallet supports for a specific blockchain,
beyond basic transaction sending. These features help initiators select
wallets with the capabilities they need.

## Examples

```typescript
const smartContracts: ChainFeature = {
  id: 'smart-contracts',
  name: 'Smart Contract Interaction',
  description: 'Full support for deploying and interacting with smart contracts',
  configuration: {
    supportsCreate2: true,
    maxCodeSize: 24576,
    supportsDelegate: true
  }
};
```

```typescript
const tokenSupport: ChainFeature = {
  id: 'erc-tokens',
  name: 'ERC Token Support',
  description: 'Native support for ERC-20, ERC-721, and ERC-1155',
  configuration: {
    standards: ['ERC-20', 'ERC-721', 'ERC-1155'],
    autoDetection: true,
    batchTransfers: true
  }
};
```

## Since

0.1.0

## See

[ChainCapability](ChainCapability.md) for feature integration

## Properties

### configuration?

> `optional` **configuration**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:709](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L709)

***

### description?

> `optional` **description**: `string`

Defined in: [core/types.ts:708](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L708)

***

### id

> **id**: `string`

Defined in: [core/types.ts:706](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L706)

***

### name

> **name**: `string`

Defined in: [core/types.ts:707](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L707)
