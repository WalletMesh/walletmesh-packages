[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isWalletInfo

# Function: isWalletInfo()

> **isWalletInfo**(`value`): `value is WalletInfo`

Defined in: core/modal-core/dist/api/types/guards.d.ts:61

Check if a value is a valid WalletInfo object

Validates that an object has all required WalletInfo properties:
- id: string identifier for the wallet
- name: display name of the wallet
- icon: URL or base64 icon data
- chains: array of supported chain types

## Parameters

### value

`unknown`

The value to check

## Returns

`value is WalletInfo`

True if value is a valid WalletInfo object

## Example

```typescript
const data = {
  id: 'metamask',
  name: 'MetaMask',
  icon: 'https://...',
  chains: ['evm']
};

if (isWalletInfo(data)) {
  // Safe to use as WalletInfo
  connectToWallet(data);
}
```
