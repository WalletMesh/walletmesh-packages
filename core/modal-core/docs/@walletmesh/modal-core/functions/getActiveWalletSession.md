[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getActiveWalletSession

# Function: getActiveWalletSession()

> **getActiveWalletSession**(`sessions`): `undefined` \| [`WalletSession`](../interfaces/WalletSession.md)

Get active session from sessions array

Returns the first connected session, or undefined if none connected.

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

## Returns

`undefined` \| [`WalletSession`](../interfaces/WalletSession.md)

Active session or undefined

## Example

```typescript
const activeSession = getActiveSession(sessions);
if (activeSession) {
  console.log('Active wallet:', activeSession.walletId);
}
```
