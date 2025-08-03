[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityPreferences

# Interface: CapabilityPreferences

Defined in: [core/types.ts:157](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L157)

Optional capability preferences for enhanced responder matching.

While CapabilityRequirements define what a wallet MUST support,
preferences indicate what would be nice to have. These help rank
and prioritize wallets that go beyond the minimum requirements.

Preferences use the same three-category model as requirements:
chains and features.

## Examples

```typescript
const preferences: CapabilityPreferences = {
  features: ['hardware-wallet']  // Prefer hardware security if available
};
```

```typescript
const preferences: CapabilityPreferences = {
  chains: ['eip155:42161'],      // Also nice to have Arbitrum support
  features: [
    'hardware-wallet',           // Prefer hardware security
    'batch-transactions',        // Prefer batch operation support
    'gasless-transactions'       // Prefer gasless UX
  ]
};
```

## Since

0.1.0

## See

[CapabilityRequirements](CapabilityRequirements.md) for mandatory requirements

## Properties

### chains?

> `optional` **chains**: `string`[]

Defined in: [core/types.ts:162](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L162)

Additional blockchain networks that would be beneficial.
These chains are not required but having them increases wallet ranking.

***

### features?

> `optional` **features**: `string`[]

Defined in: [core/types.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L168)

Additional wallet features that would enhance the user experience.
These are "nice to have" capabilities beyond the required features.
