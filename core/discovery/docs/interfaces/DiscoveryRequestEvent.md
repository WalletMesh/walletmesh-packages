[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryRequestEvent

# Interface: DiscoveryRequestEvent

Defined in: [core/types.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L203)

Discovery request event sent by initiators to discover qualified responders.

Initiates the capability-first discovery process where initiators broadcast
their requirements and only qualified responders respond. This preserves
responder privacy by avoiding enumeration of all available responders.

## Example

```typescript
const request: DiscoveryRequestEvent = {
  type: 'discovery:wallet:request',
  version: '0.1.0',
  sessionId: crypto.randomUUID(),
  required: {
    chains: ['eip155:1'],
    features: ['account-management'],
    interfaces: ['eip-1193']
  },
  origin: 'https://mydapp.com',
  initiatorInfo: {
    name: 'My dApp',
    url: 'https://mydapp.com',
    icon: 'data:image/svg+xml;base64,...'
  }
};
```

## Since

0.1.0

## See

 - [DiscoveryResponseEvent](DiscoveryResponseEvent.md) for responder responses
 - [DiscoveryInitiator](../classes/DiscoveryInitiator.md) for initiator-side implementation

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### initiatorInfo

> **initiatorInfo**: [`InitiatorInfo`](InitiatorInfo.md)

Defined in: [core/types.ts:212](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L212)

***

### optional?

> `optional` **optional**: [`CapabilityPreferences`](CapabilityPreferences.md)

Defined in: [core/types.ts:208](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L208)

***

### origin

> **origin**: `string`

Defined in: [core/types.ts:211](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L211)

***

### required

> **required**: [`CapabilityRequirements`](CapabilityRequirements.md)

Defined in: [core/types.ts:207](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L207)

***

### sessionId

> **sessionId**: `string`

Defined in: [core/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L32)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### type

> **type**: `"discovery:wallet:request"`

Defined in: [core/types.ts:204](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L204)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/types.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L31)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
