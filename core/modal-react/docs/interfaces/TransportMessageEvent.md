[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransportMessageEvent

# Interface: TransportMessageEvent

Defined in: core/modal-core/dist/types.d.ts:733

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

Defined in: core/modal-core/dist/types.d.ts:741

Message data received from the transport
Usually contains JSON-RPC formatted messages
The exact structure depends on the wallet implementation

***

### type

> **type**: `"message"`

Defined in: core/modal-core/dist/types.d.ts:735

Event type identifier - always 'message' for message events
