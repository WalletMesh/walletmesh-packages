[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / hasConnectedSession

# Function: hasConnectedSession()

> **hasConnectedSession**(`sessions`): `boolean`

Check if any sessions are connected

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

## Returns

`boolean`

True if at least one session is connected

## Example

```typescript
if (hasConnectedSession(sessions)) {
  console.log('User is connected to at least one wallet');
}
```
