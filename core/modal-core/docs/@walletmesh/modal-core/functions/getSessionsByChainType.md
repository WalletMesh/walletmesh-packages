[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getSessionsByChainType

# Function: getSessionsByChainType()

> **getSessionsByChainType**(`sessions`, `chainType`): [`WalletSession`](../interfaces/WalletSession.md)[]

Get sessions by chain type

Filters sessions to only those on the specified chain type.

## Parameters

### sessions

[`WalletSession`](../interfaces/WalletSession.md)[]

Array of wallet sessions

### chainType

[`ChainType`](../enumerations/ChainType.md)

Chain type to filter by

## Returns

[`WalletSession`](../interfaces/WalletSession.md)[]

Sessions on the specified chain type

## Example

```typescript
const evmSessions = getSessionsByChainType(sessions, 'evm');
console.log('EVM wallets:', evmSessions.map(s => s.walletId));
```
