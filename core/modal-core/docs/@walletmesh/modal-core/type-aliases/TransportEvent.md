[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransportEvent

# Type Alias: TransportEvent

> **TransportEvent** = [`TransportMessageEvent`](../interfaces/TransportMessageEvent.md) \| [`TransportConnectedEvent`](../interfaces/TransportConnectedEvent.md) \| [`TransportDisconnectedEvent`](../interfaces/TransportDisconnectedEvent.md) \| [`TransportErrorEvent`](../interfaces/TransportErrorEvent.md)

Union type for all transport events

## Remarks

Combines all possible transport event types.
Use this type when handling transport events to ensure exhaustive type checking.

## Example

```typescript
function handleTransportEvent(event: TransportEvent) {
  switch (event.type) {
    case 'connected':
      console.log('Connected');
      break;
    case 'disconnected':
      console.log('Disconnected:', event.reason);
      break;
    case 'message':
      console.log('Message:', event.data);
      break;
    case 'error':
      console.error('Error:', event.error);
      break;
  }
}
```
