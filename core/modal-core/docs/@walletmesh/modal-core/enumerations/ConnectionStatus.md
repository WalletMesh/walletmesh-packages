[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionStatus

# Enumeration: ConnectionStatus

Connection status enum representing wallet connection lifecycle states

## Remarks

This enum defines all possible states a wallet connection can be in.
Use the status helper functions (isConnected, isConnecting, etc.) for type-safe status checks.

## Example

```typescript
const connectionState = getConnectionState();

switch (connectionState.status) {
  case ConnectionStatus.Connected:
    console.log('Wallet is connected');
    break;
  case ConnectionStatus.Connecting:
    console.log('Connection in progress...');
    break;
  case ConnectionStatus.Error:
    console.log('Connection failed');
    break;
}
```

## Enumeration Members

### Connected

> **Connected**: `"connected"`

Wallet is successfully connected

***

### Connecting

> **Connecting**: `"connecting"`

Connection attempt is in progress

***

### Disconnected

> **Disconnected**: `"disconnected"`

No wallet is connected

***

### Error

> **Error**: `"error"`

Connection attempt failed or connection was lost with error

***

### Reconnecting

> **Reconnecting**: `"reconnecting"`

Attempting to reconnect after connection loss
