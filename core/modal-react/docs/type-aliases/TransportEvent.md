[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransportEvent

# Type Alias: TransportEvent

> **TransportEvent** = [`TransportMessageEvent`](../interfaces/TransportMessageEvent.md) \| [`TransportConnectedEvent`](../interfaces/TransportConnectedEvent.md) \| [`TransportDisconnectedEvent`](../interfaces/TransportDisconnectedEvent.md) \| [`TransportErrorEvent`](../interfaces/TransportErrorEvent.md)

Defined in: core/modal-core/dist/types.d.ts:856

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
