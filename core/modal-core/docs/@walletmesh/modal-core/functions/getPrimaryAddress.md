[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getPrimaryAddress

# Function: getPrimaryAddress()

> **getPrimaryAddress**(`sessions`): `undefined` \| `string`

Get primary address from active session

Returns the address from the first connected session.

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

## Returns

`undefined` \| `string`

Primary address or undefined

## Example

```typescript
const address = getPrimaryAddress(sessions);
if (address) {
  console.log('Connected address:', address);
}
```
