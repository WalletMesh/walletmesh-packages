[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getCurrentChain

# Function: getCurrentChain()

> **getCurrentChain**(`sessions`): `undefined` \| [`ChainInfo`](../interfaces/ChainInfo.md)

Get current chain from active session

Returns the chain from the first connected session.

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

## Returns

`undefined` \| [`ChainInfo`](../interfaces/ChainInfo.md)

Current chain or undefined

## Example

```typescript
const chain = getCurrentChain(sessions);
if (chain) {
  console.log('Connected to:', chain.name);
}
```
