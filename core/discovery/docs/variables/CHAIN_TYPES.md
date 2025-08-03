[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CHAIN\_TYPES

# Variable: CHAIN\_TYPES

> `const` `readonly` **CHAIN\_TYPES**: `object`

Defined in: [core/constants.ts:162](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/constants.ts#L162)

Standard chain type identifiers for blockchain classification.

Categorizes blockchain networks by their fundamental architecture
and transaction models. Used for capability matching and wallet
integration pattern selection.

## Type declaration

### ACCOUNT

> `readonly` **ACCOUNT**: `"account"` = `'account'`

### COSMOS

> `readonly` **COSMOS**: `"cosmos"` = `'cosmos'`

### CUSTOM

> `readonly` **CUSTOM**: `"custom"` = `'custom'`

### EVM

> `readonly` **EVM**: `"evm"` = `'evm'`

### SUBSTRATE

> `readonly` **SUBSTRATE**: `"substrate"` = `'substrate'`

### UTXO

> `readonly` **UTXO**: `"utxo"` = `'utxo'`

## Example

```typescript
const ethereumType = CHAIN_TYPES.EVM;     // 'evm'
const bitcoinType = CHAIN_TYPES.UTXO;     // 'utxo'
const solanaType = CHAIN_TYPES.ACCOUNT;   // 'account'
```

## Since

0.1.0

## See

[ChainCapability](../interfaces/ChainCapability.md) for chain-specific capabilities
