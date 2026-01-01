[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainManagerConfig

# Interface: ChainManagerConfig

Chain configuration for chain manager utilities

## Remarks

Used by ChainManager for adding EVM chains to wallets.
Uses 'id' instead of 'chainId' for backward compatibility.
For the canonical chain information type, use ChainInfo from services.

## Properties

### blockExplorerUrls?

> `optional` **blockExplorerUrls**: `string`[]

***

### id

> **id**: `string`

***

### name

> **name**: `string`

***

### nativeCurrency

> **nativeCurrency**: `object`

#### decimals

> **decimals**: `number`

#### name

> **name**: `string`

#### symbol

> **symbol**: `string`

***

### rpcUrls

> **rpcUrls**: `string`[]
