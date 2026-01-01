[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / filterSessionsByStatus

# Function: filterSessionsByStatus()

> **filterSessionsByStatus**(`sessions`, `status`): [`WalletSession`](../interfaces/WalletSession.md)[]

Filter sessions by connection status

Returns only sessions that match the specified status.

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

### status

[`SessionStatus`](../type-aliases/SessionStatus.md) = `'connected'`

Status to filter by (default: 'connected')

## Returns

[`WalletSession`](../interfaces/WalletSession.md)[]

Filtered sessions

## Example

```typescript
const connectedSessions = filterSessionsByStatus(sessions, 'connected');
console.log(connectedSessions);
// [{ walletId: 'metamask', status: 'connected', ... }]
```
