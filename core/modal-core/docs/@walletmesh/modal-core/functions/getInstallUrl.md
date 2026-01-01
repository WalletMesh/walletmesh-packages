[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getInstallUrl

# Function: getInstallUrl()

> **getInstallUrl**(`walletId`): `null` \| `string`

Get install URL for a wallet

Returns the appropriate install URL based on wallet ID and platform.

## Parameters

### walletId

`string`

Wallet identifier

## Returns

`null` \| `string`

Install URL or null if not available

## Example

```typescript
const installUrl = getInstallUrl('metamask');
if (installUrl) {
  window.open(installUrl, '_blank');
}
```
