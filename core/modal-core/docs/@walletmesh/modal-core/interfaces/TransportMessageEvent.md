[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransportMessageEvent

# Interface: TransportMessageEvent

Interface for transport message event

## Remarks

Event emitted when a message is received through the transport.
Messages typically contain JSON-RPC requests or responses from the wallet.

 TransportMessageEvent

## Example

```typescript
transport.on('message', (event: TransportMessageEvent) => {
  if (event.type === 'message') {
    console.log('Received data:', event.data);
    // Handle JSON-RPC response
  }
});
```

## Properties

### data

> **data**: `unknown`

Message data received from the transport
Usually contains JSON-RPC formatted messages
The exact structure depends on the wallet implementation

***

### type

> **type**: `"message"`

Event type identifier - always 'message' for message events
