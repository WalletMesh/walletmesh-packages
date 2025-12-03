[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityMatchResult

# Interface: CapabilityMatchResult

Defined in: [core/discovery/src/responder/CapabilityMatcher.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/responder/CapabilityMatcher.ts#L54)

Result of capability matching between responder and initiator requirements.

Contains the matching result, capability intersection (if qualified),
and details about any missing capabilities for debugging.

## Examples

```typescript
const result: CapabilityMatchResult = {
  canFulfill: true,
  intersection: {
    required: {
      technologies: [{
        type: 'evm',
        interfaces: ['eip-1193'],
        features: ['eip-712']
      }],
      features: ['account-management']
    }
  },
  missing: {
    technologies: [],
    features: []
  }
};
```

```typescript
const result: CapabilityMatchResult = {
  canFulfill: false,
  intersection: null,
  missing: {
    technologies: [{
      type: 'solana',
      reason: 'Technology not supported'
    }],
    features: []
  }
};
```

## Since

0.1.0

## Properties

### canFulfill

> **canFulfill**: `boolean`

Defined in: [core/discovery/src/responder/CapabilityMatcher.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/responder/CapabilityMatcher.ts#L55)

***

### intersection

> **intersection**: `null` \| [`CapabilityIntersection`](CapabilityIntersection.md)

Defined in: [core/discovery/src/responder/CapabilityMatcher.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/responder/CapabilityMatcher.ts#L56)

***

### missing

> **missing**: `object`

Defined in: [core/discovery/src/responder/CapabilityMatcher.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/responder/CapabilityMatcher.ts#L57)

#### features

> **features**: `string`[]

#### technologies

> **technologies**: `object`[]
