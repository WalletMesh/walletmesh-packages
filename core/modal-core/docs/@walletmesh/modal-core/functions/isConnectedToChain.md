[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isConnectedToChain

# Function: isConnectedToChain()

> **isConnectedToChain**(`sessions`, `chainId`): `boolean`

Check if connected to a specific chain

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

### chainId

`string`

Chain ID to check

## Returns

`boolean`

True if connected to the specified chain

## Example

```typescript
if (isConnectedToChain(sessions, '1')) {
  console.log('Connected to Ethereum mainnet');
}
```
