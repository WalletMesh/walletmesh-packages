[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CHAIN\_TYPES

# Variable: CHAIN\_TYPES

> `const` `readonly` **CHAIN\_TYPES**: `object`

Defined in: [core/discovery/src/core/constants.ts:162](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/constants.ts#L162)

Standard chain type identifiers for blockchain classification.

Categorizes blockchain networks by their fundamental architecture
and transaction models. Used for capability matching and wallet
integration pattern selection.

## Type Declaration

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
