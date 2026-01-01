[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isWalletInstalled

# Function: isWalletInstalled()

> **isWalletInstalled**(`wallet`): `boolean`

Check if a wallet is installed in the browser

Performs basic checks to determine if a wallet is available in the browser.
Note: This is a heuristic check and may not be 100% accurate.

## Parameters

### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

Wallet to check

## Returns

`boolean`

True if wallet appears to be installed

## Example

```typescript
const installed = isWalletInstalled(wallet);
if (!installed) {
  showInstallPrompt(wallet);
}
```
