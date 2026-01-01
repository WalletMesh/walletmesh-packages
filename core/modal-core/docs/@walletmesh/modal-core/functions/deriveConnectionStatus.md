[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / deriveConnectionStatus

# Function: deriveConnectionStatus()

> **deriveConnectionStatus**(`sessionStatus?`, `currentView?`, `isReconnecting?`): [`DerivedConnectionFlags`](../interfaces/DerivedConnectionFlags.md)

Derive connection flags from session and UI state

Provides a consistent way to determine connection status across UI frameworks.

## Parameters

### sessionStatus?

[`SessionStatus`](../type-aliases/SessionStatus.md)

Current session status

### currentView?

[`UIView`](../type-aliases/UIView.md)

Current UI view

### isReconnecting?

`boolean` = `false`

Whether this is a reconnection attempt

## Returns

[`DerivedConnectionFlags`](../interfaces/DerivedConnectionFlags.md)

Connection flags

## Example

```typescript
const flags = deriveConnectionFlags('connected', 'connected', false);
console.log(flags);
// {
//   status: 'connected',
//   isConnected: true,
//   isConnecting: false,
//   isReconnecting: false,
//   isDisconnected: false
// }
```
