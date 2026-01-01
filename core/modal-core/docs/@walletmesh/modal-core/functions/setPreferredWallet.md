[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / setPreferredWallet

# Function: setPreferredWallet()

> **setPreferredWallet**(`walletId`, `storageKey`): `void`

Set preferred wallet in storage

## Parameters

### walletId

Wallet ID to store, or null to clear preference

`null` | `string`

### storageKey

`string` = `DEFAULT_WALLET_PREFERENCE_KEY`

Storage key to use (default: 'walletmesh-preferred-wallet')

## Returns

`void`

## Example

```typescript
// Set preference
setPreferredWallet('metamask');

// Clear preference
setPreferredWallet(null);
```
