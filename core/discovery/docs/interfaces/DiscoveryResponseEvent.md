[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryResponseEvent

# Interface: DiscoveryResponseEvent

Defined in: [core/types.ts:381](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L381)

Discovery response event sent by responders that can fulfill requirements.

Only sent by responders that can satisfy ALL required capabilities.
Contains responder identification, capability intersection, and optional
metadata for user selection.

## Example

```typescript
const response: DiscoveryResponseEvent = {
  type: 'discovery:wallet:announce',
  version: '0.1.0',
  sessionId: 'session-uuid',
  timestamp: Date.now(),
  responderId: crypto.randomUUID(), // Ephemeral ID
  rdns: 'com.example.wallet',
  name: 'Example Wallet',
  icon: 'data:image/png;base64,...',
  matched: {
    required: {
      chains: ['eip155:1'],
      features: ['account-management'],
      interfaces: ['eip-1193']
    }
  },
  responderVersion: '1.2.3',
  // Transport configuration
  transportConfig: {
    type: 'extension',
    extensionId: 'abcdefghijklmnop',
    walletAdapter: 'MetaMaskAdapter'
  }
};
```

## Since

0.1.0

## See

 - [DiscoveryRequestEvent](DiscoveryRequestEvent.md) for discovery initiation
 - [DiscoveryResponder](../classes/DiscoveryResponder.md) for responder-side implementation

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### description?

> `optional` **description**: `string`

Defined in: [core/types.ts:395](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L395)

***

### icon

> **icon**: `string`

Defined in: [core/types.ts:388](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L388)

***

### matched

> **matched**: [`CapabilityIntersection`](CapabilityIntersection.md)

Defined in: [core/types.ts:391](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L391)

***

### name

> **name**: `string`

Defined in: [core/types.ts:387](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L387)

***

### rdns

> **rdns**: `string`

Defined in: [core/types.ts:386](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L386)

***

### responderId

> **responderId**: `string`

Defined in: [core/types.ts:385](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L385)

***

### responderVersion?

> `optional` **responderVersion**: `string`

Defined in: [core/types.ts:394](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L394)

***

### sessionId

> **sessionId**: `string`

Defined in: [core/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L32)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### transportConfig?

> `optional` **transportConfig**: [`TransportConfig`](TransportConfig.md)

Defined in: [core/types.ts:398](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L398)

***

### type

> **type**: `"discovery:wallet:response"`

Defined in: [core/types.ts:382](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L382)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/types.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L31)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
