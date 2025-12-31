[**@walletmesh/modal-core v0.0.2**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ConnectionState

# Enumeration: ConnectionState

Connection state enum for simplified wallet lifecycle tracking

## Remarks

A simplified version of ConnectionStatus used in some UI contexts.
Includes an additional 'disconnecting' state for better UX during disconnection.

## Example

```typescript
function getConnectionMessage(state: ConnectionState): string {
  switch (state) {
    case ConnectionState.Disconnected:
      return 'No wallet connected';
    case ConnectionState.Connecting:
      return 'Connecting wallet...';
    case ConnectionState.Connected:
      return 'Wallet connected';
    case ConnectionState.Disconnecting:
      return 'Disconnecting wallet...';
    case ConnectionState.Error:
      return 'Connection failed';
  }
}
```

## Enumeration Members

### Connected

> **Connected**: `"connected"`

Successfully connected

***

### Connecting

> **Connecting**: `"connecting"`

Connection attempt in progress

***

### Disconnected

> **Disconnected**: `"disconnected"`

No active connection

***

### Disconnecting

> **Disconnecting**: `"disconnecting"`

Disconnection in progress

***

### Error

> **Error**: `"error"`

Connection error occurred
