[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CapabilityMatchResult

# Interface: CapabilityMatchResult

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

***

### intersection

> **intersection**: `null` \| `CapabilityIntersection`

***

### missing

> **missing**: `object`

#### features

> **features**: `string`[]

#### technologies

> **technologies**: `object`[]
