[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryMessage

# Type Alias: DiscoveryMessage

> **DiscoveryMessage** = [`DiscoveryRequestEvent`](../interfaces/DiscoveryRequestEvent.md) \| [`DiscoveryResponseEvent`](../interfaces/DiscoveryResponseEvent.md) \| [`DiscoveryCompleteEvent`](../interfaces/DiscoveryCompleteEvent.md) \| [`DiscoveryErrorEvent`](../interfaces/DiscoveryErrorEvent.md)

Defined in: [core/types.ts:1599](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1599)

Union type of all discovery protocol messages.

Represents all possible message types that can be sent or received
in the discovery protocol. Useful for type guards and message routing.

## Examples

```typescript
function handleMessage(message: DiscoveryMessage) {
  switch (message.type) {
    case 'discovery:wallet:request':
      handleDiscoveryRequest(message);
      break;
    case 'discovery:wallet:response':
      handleDiscoveryResponse(message);
      break;
    case 'discovery:wallet:complete':
      handleDiscoveryComplete(message);
      break;
    case 'discovery:wallet:error':
      handleDiscoveryError(message);
      break;
  }
}
```

```typescript
function isDiscoveryMessage(data: unknown): data is DiscoveryMessage {
  if (typeof data !== 'object' || data === null) return false;

  // Type-safe property access
  const msg = data as Record<string, unknown>;

  return (
    msg.type === 'discovery:wallet:request' ||
    msg.type === 'discovery:wallet:response' ||
    msg.type === 'discovery:wallet:complete' ||
    msg.type === 'discovery:wallet:error'
  );
}
```

## Since

0.1.0
