[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectionStatus

# Enumeration: ConnectionStatus

Defined in: core/modal-core/dist/core/types.d.ts:36

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

Defined in: core/modal-core/dist/core/types.d.ts:42

Wallet is successfully connected

***

### Connecting

> **Connecting**: `"connecting"`

Defined in: core/modal-core/dist/core/types.d.ts:40

Connection attempt is in progress

***

### Disconnected

> **Disconnected**: `"disconnected"`

Defined in: core/modal-core/dist/core/types.d.ts:38

No wallet is connected

***

### Error

> **Error**: `"error"`

Defined in: core/modal-core/dist/core/types.d.ts:44

Connection attempt failed or connection was lost with error

***

### Reconnecting

> **Reconnecting**: `"reconnecting"`

Defined in: core/modal-core/dist/core/types.d.ts:46

Attempting to reconnect after connection loss
