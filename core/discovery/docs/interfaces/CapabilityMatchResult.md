[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityMatchResult

# Interface: CapabilityMatchResult

Defined in: [responder/CapabilityMatcher.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/CapabilityMatcher.ts#L47)

Result of capability matching between responder and initiator requirements.

Contains the matching result, capability intersection (if qualified),
and details about any missing capabilities for debugging.

## Examples

```typescript
const result: CapabilityMatchResult = {
  canFulfill: true,
  intersection: {
    required: {
      chains: ['eip155:1'],
      features: ['account-management'],
      interfaces: ['eip-1193']
    },
    optional: {
      features: ['hardware-wallet']
    }
  },
  missing: {
    chains: [],
    features: [],
    interfaces: []
  }
};
```

```typescript
const result: CapabilityMatchResult = {
  canFulfill: false,
  intersection: null,
  missing: {
    chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],  // Responder doesn't support Solana
    features: [],
    interfaces: []
  }
};
```

## Since

0.1.0

## Properties

### canFulfill

> **canFulfill**: `boolean`

Defined in: [responder/CapabilityMatcher.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/CapabilityMatcher.ts#L48)

***

### intersection

> **intersection**: `null` \| [`CapabilityIntersection`](CapabilityIntersection.md)

Defined in: [responder/CapabilityMatcher.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/CapabilityMatcher.ts#L49)

***

### missing

> **missing**: `object`

Defined in: [responder/CapabilityMatcher.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/CapabilityMatcher.ts#L50)

#### chains

> **chains**: `string`[]

#### features

> **features**: `string`[]

#### interfaces

> **interfaces**: `string`[]
