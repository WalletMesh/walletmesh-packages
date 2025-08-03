[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityIntersection

# Interface: CapabilityIntersection

Defined in: [core/types.ts:265](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L265)

Capability intersection between responder and initiator requirements.

This represents the exact overlap between what the dApp requested and
what the wallet can provide. It contains only capabilities that are
both requested by the initiator AND supported by the responder.

This privacy-preserving approach ensures wallets never reveal capabilities
that weren't specifically requested, preventing capability enumeration attacks.

The intersection maintains the same three-category structure:
- chains: Blockchains both requested and supported
- features: Functionalities both requested and available
- interfaces: API standards both requested and implemented

## Examples

```typescript
// If dApp requests: ['eip155:1', 'eip155:137']
// And wallet supports: ['eip155:1', 'eip155:137', 'eip155:42161']
// Intersection will be: ['eip155:1', 'eip155:137'] (not revealing Arbitrum)

const intersection: CapabilityIntersection = {
  required: {
    chains: ['eip155:1', 'eip155:137'],
    features: ['account-management'],
    interfaces: ['eip-1193']
  }
};
```

```typescript
const intersection: CapabilityIntersection = {
  required: {
    chains: ['eip155:1'],
    features: ['account-management', 'transaction-signing'],
    interfaces: ['eip-1193']
  },
  optional: {
    features: ['hardware-wallet']  // Wallet has this preferred feature
  }
};
```

## Since

0.1.0

## See

 - [CapabilityMatcher](../classes/CapabilityMatcher.md) for intersection calculation
 - [CapabilityRequirements](CapabilityRequirements.md) for requirement structure
 - [CapabilityPreferences](CapabilityPreferences.md) for preference structure

## Properties

### optional?

> `optional` **optional**: `Partial`\<[`CapabilityPreferences`](CapabilityPreferences.md)\>

Defined in: [core/types.ts:276](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L276)

The intersection of optional preferences.
These were requested as "nice to have" and are supported by the wallet.

***

### required

> **required**: [`CapabilityRequirements`](CapabilityRequirements.md)

Defined in: [core/types.ts:270](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L270)

The intersection of required capabilities.
All of these were requested as mandatory and are supported by the wallet.
