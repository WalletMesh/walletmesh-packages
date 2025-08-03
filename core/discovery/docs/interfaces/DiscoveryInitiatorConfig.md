[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryInitiatorConfig

# Interface: DiscoveryInitiatorConfig

Defined in: [core/types.ts:1472](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1472)

Configuration for initiator-side discovery listener.

Defines capability requirements, initiator information, security policy,
and operational parameters for discovering qualified responders.

## Example

```typescript
const config: DiscoveryInitiatorConfig = {
  requirements: {
    chains: ['eip155:1'],
    features: ['account-management'],
    interfaces: ['eip-1193']
  },
  initiatorInfo: {
    name: 'My dApp',
    url: 'https://mydapp.com',
    icon: 'data:image/svg+xml;base64,...'
  },
  timeout: 5000,
  securityPolicy: {
    requireHttps: true,
    allowLocalhost: false
  }
};
```

## Since

0.1.0

## See

[DiscoveryInitiator](../classes/DiscoveryInitiator.md) for implementation

## Properties

### eventTarget?

> `optional` **eventTarget**: `EventTarget`

Defined in: [core/types.ts:1478](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1478)

***

### initiatorInfo

> **initiatorInfo**: [`InitiatorInfo`](InitiatorInfo.md)

Defined in: [core/types.ts:1475](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1475)

***

### logger?

> `optional` **logger**: [`Logger`](Logger.md)

Defined in: [core/types.ts:1479](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1479)

***

### preferences?

> `optional` **preferences**: [`CapabilityPreferences`](CapabilityPreferences.md)

Defined in: [core/types.ts:1474](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1474)

***

### requirements

> **requirements**: [`CapabilityRequirements`](CapabilityRequirements.md)

Defined in: [core/types.ts:1473](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1473)

***

### securityPolicy?

> `optional` **securityPolicy**: [`SecurityPolicy`](SecurityPolicy.md)

Defined in: [core/types.ts:1476](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1476)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [core/types.ts:1477](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1477)
