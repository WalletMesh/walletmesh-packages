[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ResponderFeature

# Interface: ResponderFeature

Defined in: [core/types.ts:817](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L817)

Responder feature definition for wallet-specific functionalities.

Features represent the second component of a wallet's capabilities
(alongside chains and interfaces). They describe specific functionalities
that go beyond basic blockchain support, such as:

- Security features (hardware wallet, multi-sig)
- Transaction features (batch operations, gasless)
- User experience features (social recovery, cross-chain swaps)

Features help dApps select wallets based on their specific needs
beyond just blockchain compatibility.

## Examples

```typescript
const hardwareFeature: ResponderFeature = {
  id: 'hardware-wallet',
  name: 'Hardware Security Module',
  description: 'Private keys stored in secure hardware',
  version: '2.1.0',
  configuration: {
    deviceTypes: ['ledger', 'trezor'],
    securityLevel: 'fips-140-2'
  }
};
```

```typescript
const batchFeature: ResponderFeature = {
  id: 'batch-transactions',
  name: 'Batch Transaction Support',
  description: 'Execute multiple transactions in a single operation',
  configuration: {
    maxBatchSize: 10,
    atomicExecution: true
  }
};
```

## Since

0.1.0

## See

 - [ResponderInfo](../type-aliases/ResponderInfo.md) for how features are integrated into wallet info
 - [RESPONDER\_FEATURES](../variables/RESPONDER_FEATURES.md) in constants.ts for standard feature identifiers
 - [CapabilityRequirements](CapabilityRequirements.md) for how features are requested

## Properties

### configuration?

> `optional` **configuration**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:843](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L843)

Feature-specific configuration and metadata.
Structure varies by feature type.

***

### description?

> `optional` **description**: `string`

Defined in: [core/types.ts:832](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L832)

Detailed description of what this feature provides.

***

### id

> **id**: `string`

Defined in: [core/types.ts:822](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L822)

Unique identifier for the feature.
Should match values in RESPONDER_FEATURES when using standard features.

***

### name

> **name**: `string`

Defined in: [core/types.ts:827](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L827)

Human-readable name for the feature.

***

### version?

> `optional` **version**: `string`

Defined in: [core/types.ts:837](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L837)

Version of the feature implementation.
