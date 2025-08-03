[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryCompleteEvent

# Interface: DiscoveryCompleteEvent

Defined in: [core/types.ts:1790](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1790)

Event emitted when a discovery session completes successfully.

This event is broadcast when a discovery session transitions to the COMPLETED state,
indicating that the discovery process has finished and responders have been collected.
The event provides basic session information without exposing sensitive details.

## Example

```typescript
// Listen for completion events
eventTarget.addEventListener(DISCOVERY_EVENTS.COMPLETE, (event) => {
  const completionEvent = event as CustomEvent<DiscoveryCompleteEvent>;
  console.log(`Discovery session ${completionEvent.detail.sessionId} completed`);
  console.log(`Found ${completionEvent.detail.respondersFound} responders`);
});
```

## Since

0.5.0

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### reason

> **reason**: `"timeout"` \| `"manual-stop"` \| `"max-responders"`

Defined in: [core/types.ts:1794](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1794)

Reason for completion

***

### respondersFound

> **respondersFound**: `number`

Defined in: [core/types.ts:1797](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1797)

Number of qualified responders found

***

### sessionId

> **sessionId**: `string`

Defined in: [core/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L32)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### type

> **type**: `"discovery:wallet:complete"`

Defined in: [core/types.ts:1791](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1791)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/types.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L31)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
