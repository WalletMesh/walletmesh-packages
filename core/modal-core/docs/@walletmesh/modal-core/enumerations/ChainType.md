[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainType

# Enumeration: ChainType

Enum for blockchain types supported by wallet connectors

This enum represents the different blockchain ecosystems that wallets can connect to.
Add new chain types here as they are supported by the framework.

## Example

```ts
// Check if a wallet supports EVM chains
if (wallet.chains.includes(ChainType.Evm)) {
  // Connect to an EVM chain
}
```

## Enumeration Members

### Aztec

> **Aztec**: `"aztec"`

Aztec network

***

### Evm

> **Evm**: `"evm"`

Ethereum Virtual Machine based chains (Ethereum, Polygon, Arbitrum, etc.)

***

### Solana

> **Solana**: `"solana"`

Solana blockchain
