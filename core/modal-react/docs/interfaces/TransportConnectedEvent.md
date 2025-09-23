[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransportConnectedEvent

# Interface: TransportConnectedEvent

Defined in: core/modal-core/dist/types.d.ts:760

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

Defined in: core/modal-core/dist/types.d.ts:762

Event type identifier - always 'connected' for connection events
