[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / BaseDiscoveryMessage

# Interface: BaseDiscoveryMessage

Defined in: [core/types.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L29)

Base interface for all discovery protocol messages.

All protocol messages extend this interface to ensure consistent
structure and enable protocol version compatibility checks.

## Example

```typescript
const message: BaseDiscoveryMessage = {
  type: 'discovery:wallet:request',
  version: '0.1.0',
  sessionId: crypto.randomUUID()
};
```

## Since

0.1.0

## See

 - [DiscoveryRequestEvent](DiscoveryRequestEvent.md) for request messages
 - [DiscoveryResponseEvent](DiscoveryResponseEvent.md) for response messages
 - [DiscoveryCompleteEvent](DiscoveryCompleteEvent.md) for completion events
 - [DiscoveryErrorEvent](DiscoveryErrorEvent.md) for error events

## Extended by

- [`DiscoveryRequestEvent`](DiscoveryRequestEvent.md)
- [`DiscoveryResponseEvent`](DiscoveryResponseEvent.md)
- [`DiscoveryCompleteEvent`](DiscoveryCompleteEvent.md)
- [`DiscoveryErrorEvent`](DiscoveryErrorEvent.md)

## Properties

### sessionId

> **sessionId**: `string`

Defined in: [core/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L32)

***

### type

> **type**: `string`

Defined in: [core/types.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L30)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/types.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L31)
