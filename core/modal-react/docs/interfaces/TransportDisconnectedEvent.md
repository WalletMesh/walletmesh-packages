[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransportDisconnectedEvent

# Interface: TransportDisconnectedEvent

Defined in: core/modal-core/dist/types.d.ts:783

Interface for transport disconnection event

## Remarks

Event emitted when the transport disconnects.
This can happen due to network issues, wallet closure, or explicit disconnection.

 TransportDisconnectedEvent

## Example

```typescript
transport.on('disconnected', (event: TransportDisconnectedEvent) => {
  console.log('Transport disconnected:', event.reason);
  if (event.reason === 'wallet_closed') {
    // Handle wallet closure
  }
});
```

## Properties

### reason?

> `optional` **reason**: `string`

Defined in: core/modal-core/dist/types.d.ts:794

Optional reason for disconnection
Common reasons:
- 'wallet_closed': User closed the wallet
- 'network_error': Network connectivity issues
- 'timeout': Connection timed out
- 'user_rejection': User rejected the connection

***

### type

> **type**: `"disconnected"`

Defined in: core/modal-core/dist/types.d.ts:785

Event type identifier - always 'disconnected' for disconnection events
