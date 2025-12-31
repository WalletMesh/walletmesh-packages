[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransportDisconnectedEvent

# Interface: TransportDisconnectedEvent

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

Optional reason for disconnection
Common reasons:
- 'wallet_closed': User closed the wallet
- 'network_error': Network connectivity issues
- 'timeout': Connection timed out
- 'user_rejection': User rejected the connection

***

### type

> **type**: `"disconnected"`

Event type identifier - always 'disconnected' for disconnection events
