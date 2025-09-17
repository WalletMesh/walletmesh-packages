[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RESPONDER\_INTERFACES

# Variable: RESPONDER\_INTERFACES

> `const` `readonly` **RESPONDER\_INTERFACES**: `object`

Defined in: [core/discovery/src/core/constants.ts:369](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/core/constants.ts#L369)

Standard interface identifiers for responder APIs.

Interfaces represent the third component of a wallet's capabilities
(alongside chains and features). They define the programmatic API
standards that wallets implement for dApp communication.

While features describe WHAT a wallet can do, interfaces describe
HOW dApps can interact with the wallet programmatically.

## Type Declaration

### AZTEC\_WALLET\_API\_V1

> `readonly` **AZTEC\_WALLET\_API\_V1**: `"aztec-wallet-api-v1"` = `'aztec-wallet-api-v1'`

Aztec Wallet API v1: Interface for privacy-focused Aztec network.
Supports private transactions and zero-knowledge proof operations.

### EIP1193

> `readonly` **EIP1193**: `"eip-1193"` = `'eip-1193'`

EIP-1193: Ethereum Provider JavaScript API.
Standard interface for Ethereum wallets, defining methods like
eth_requestAccounts, eth_sendTransaction, etc.

### PHANTOM\_API

> `readonly` **PHANTOM\_API**: `"phantom-api"` = `'phantom-api'`

Phantom API: Phantom wallet's extended interface.
Includes additional features beyond standard Solana wallet adapter.

### SOLANA\_WALLET\_ADAPTER

> `readonly` **SOLANA\_WALLET\_ADAPTER**: `"solana-wallet-adapter"` = `'solana-wallet-adapter'`

Solana Wallet Adapter: Adapter pattern for Solana wallets.
Provides a unified interface for various Solana wallet implementations.

### SOLANA\_WALLET\_STANDARD

> `readonly` **SOLANA\_WALLET\_STANDARD**: `"solana-wallet-standard"` = `'solana-wallet-standard'`

Wallet Standard: Solana's standardized wallet interface.
Defines how wallets expose themselves and interact with Solana dApps.

## Examples

```typescript
const ethereumRequirements = {
  chains: ['eip155:1'],
  features: ['account-management', 'transaction-signing'],
  interfaces: [RESPONDER_INTERFACES.EIP1193]  // Standard Ethereum provider
};
```

```typescript
const solanaRequirements = {
  chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
  features: ['account-management', 'transaction-signing'],
  interfaces: [
    RESPONDER_INTERFACES.SOLANA_WALLET_STANDARD,      // Solana wallet standard
    RESPONDER_INTERFACES.SOLANA_WALLET_ADAPTER // Adapter pattern support
  ]
};
```

```typescript
const multiChainRequirements = {
  chains: ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
  features: ['account-management', 'cross-chain-swaps'],
  interfaces: [
    RESPONDER_INTERFACES.EIP1193,              // For Ethereum
    RESPONDER_INTERFACES.SOLANA_WALLET_STANDARD       // For Solana
  ]
};
```

## Since

0.1.0

## See

 - [CapabilityRequirements](../interfaces/CapabilityRequirements.md) for interface requirements
 - [RESPONDER\_FEATURES](RESPONDER_FEATURES.md) for feature capabilities
