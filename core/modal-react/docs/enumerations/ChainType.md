[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainType

# Enumeration: ChainType

Defined in: core/modal-core/dist/core/types.d.ts:63

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

Defined in: core/modal-core/dist/core/types.d.ts:69

Aztec network

***

### Evm

> **Evm**: `"evm"`

Defined in: core/modal-core/dist/core/types.d.ts:65

Ethereum Virtual Machine based chains (Ethereum, Polygon, Arbitrum, etc.)

***

### Solana

> **Solana**: `"solana"`

Defined in: core/modal-core/dist/core/types.d.ts:67

Solana blockchain
