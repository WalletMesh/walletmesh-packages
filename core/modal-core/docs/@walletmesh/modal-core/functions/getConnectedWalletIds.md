[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getConnectedWalletIds

# Function: getConnectedWalletIds()

> **getConnectedWalletIds**(`sessions`): `string`[]

Get connected wallet IDs

Extracts wallet IDs from connected sessions.

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

## Returns

`string`[]

Array of connected wallet IDs

## Example

```typescript
const walletIds = getConnectedWalletIds(sessions);
console.log(walletIds);
// ['metamask', 'phantom']
```
