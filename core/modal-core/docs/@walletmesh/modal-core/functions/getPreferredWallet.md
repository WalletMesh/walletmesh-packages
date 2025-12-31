[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getPreferredWallet

# Function: getPreferredWallet()

> **getPreferredWallet**(`storageKey`): `null` \| `string`

Get preferred wallet from storage

## Parameters

### storageKey

`string` = `DEFAULT_WALLET_PREFERENCE_KEY`

Storage key to use (default: 'walletmesh-preferred-wallet')

## Returns

`null` \| `string`

Wallet ID if found, null otherwise

## Example

```typescript
const preferredWalletId = getPreferredWallet();
if (preferredWalletId) {
  console.log('User prefers:', preferredWalletId);
}
```
