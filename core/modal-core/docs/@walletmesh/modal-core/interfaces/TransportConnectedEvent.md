[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransportConnectedEvent

# Interface: TransportConnectedEvent

Interface for transport connection event

## Remarks

Event emitted when the transport successfully connects.
This indicates the communication channel is established and ready for messages.

 TransportConnectedEvent

## Example

```typescript
transport.on('connected', (event: TransportConnectedEvent) => {
  console.log('Transport connected!');
  // Now safe to send messages
});
```

## Properties

### type

> **type**: `"connected"`

Event type identifier - always 'connected' for connection events
