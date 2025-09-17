[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RESPONDER\_FEATURES

# Variable: RESPONDER\_FEATURES

> `const` `readonly` **RESPONDER\_FEATURES**: `object`

Defined in: [core/discovery/src/core/constants.ts:227](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/core/constants.ts#L227)

Standard responder feature identifiers for capability matching.

Features represent specific wallet functionalities beyond basic blockchain support.
They are one of three components that make up a wallet's complete capabilities:

1. **Chains**: Which blockchains are supported (e.g., 'eip155:1')
2. **Features**: What the wallet can do (defined here)
3. **Interfaces**: How to communicate with the wallet (e.g., 'eip-1193')

Features focus on user-facing functionality and security characteristics,
helping dApps select wallets based on their specific needs.

## Type Declaration

### ACCOUNT\_MANAGEMENT

> `readonly` **ACCOUNT\_MANAGEMENT**: `"account-management"` = `'account-management'`

Basic account viewing and management functionality.
Includes listing accounts, switching active account, and account metadata.
This is typically a minimum requirement for any dApp connection.

### BATCH\_TRANSACTIONS

> `readonly` **BATCH\_TRANSACTIONS**: `"batch-transactions"` = `'batch-transactions'`

Batch transaction execution in a single operation.
Allows multiple transactions to be bundled and executed together,
saving gas and improving UX for complex operations.

### CROSS\_CHAIN\_SWAPS

> `readonly` **CROSS\_CHAIN\_SWAPS**: `"cross-chain-swaps"` = `'cross-chain-swaps'`

Native cross-chain swap functionality.
Built-in support for swapping assets across different blockchains
without leaving the wallet interface.

### DEFI\_INTEGRATION

> `readonly` **DEFI\_INTEGRATION**: `"defi-integration"` = `'defi-integration'`

Deep DeFi protocol integration and position tracking.
Advanced features for yield farming, liquidity provision, lending,
and other DeFi activities with position visualization.

### GASLESS\_TRANSACTIONS

> `readonly` **GASLESS\_TRANSACTIONS**: `"gasless-transactions"` = `'gasless-transactions'`

Gasless transaction support (meta-transactions, relayers).
Enables users to perform transactions without holding native tokens
for gas, improving UX especially for new users.

### HARDWARE\_ACCELERATION

> `readonly` **HARDWARE\_ACCELERATION**: `"hardware-acceleration"` = `'hardware-acceleration'`

Hardware acceleration for cryptographic operations.
Utilizes specialized hardware for faster signing, key generation,
and cryptographic computations.

### HARDWARE\_WALLET

> `readonly` **HARDWARE\_WALLET**: `"hardware-wallet"` = `'hardware-wallet'`

Hardware wallet integration for enhanced security.
Private keys are stored in secure hardware (Ledger, Trezor, etc.),
providing protection against malware and remote attacks.

### MESSAGE\_SIGNING

> `readonly` **MESSAGE\_SIGNING**: `"message-signing"` = `'message-signing'`

Ability to sign arbitrary messages for authentication/verification.
Used for proving account ownership, signing in to dApps, and creating
verifiable attestations without blockchain transactions.

### MULTI\_SIGNATURE

> `readonly` **MULTI\_SIGNATURE**: `"multi-signature"` = `'multi-signature'`

Multi-signature wallet support requiring multiple approvals.
Essential for DAOs, treasury management, and high-security applications
where transactions need approval from multiple parties.

### NFT\_SUPPORT

> `readonly` **NFT\_SUPPORT**: `"nft-support"` = `'nft-support'`

Enhanced NFT display and management features.
Specialized support for viewing, organizing, and interacting with
NFT collections beyond basic token transfers.

### PRIVATE\_TRANSACTIONS

> `readonly` **PRIVATE\_TRANSACTIONS**: `"private-transactions"` = `'private-transactions'`

Privacy-preserving transaction capabilities.
Support for private transactions, zero-knowledge proofs,
and confidential transfers (particularly for privacy chains).

### SOCIAL\_RECOVERY

> `readonly` **SOCIAL\_RECOVERY**: `"social-recovery"` = `'social-recovery'`

Social recovery mechanisms for account access restoration.
Allows users to recover accounts through trusted contacts or
social verification, reducing dependency on seed phrases.

### TRANSACTION\_SIGNING

> `readonly` **TRANSACTION\_SIGNING**: `"transaction-signing"` = `'transaction-signing'`

Ability to sign and broadcast blockchain transactions.
Core functionality for interacting with smart contracts and sending tokens.
Usually paired with account-management as a basic requirement.

## Examples

```typescript
// Minimal wallet requirements - just the essentials
const basicRequirements = {
  chains: ['eip155:1'],
  features: [
    RESPONDER_FEATURES.ACCOUNT_MANAGEMENT,   // View accounts
    RESPONDER_FEATURES.TRANSACTION_SIGNING    // Sign transactions
  ],
  interfaces: ['eip-1193']
};
```

```typescript
// DeFi application with enhanced requirements
const defiRequirements = {
  chains: ['eip155:1', 'eip155:137'],
  features: [
    RESPONDER_FEATURES.ACCOUNT_MANAGEMENT,
    RESPONDER_FEATURES.TRANSACTION_SIGNING,
    RESPONDER_FEATURES.BATCH_TRANSACTIONS,    // Complex DeFi operations
    RESPONDER_FEATURES.GASLESS_TRANSACTIONS   // Better UX
  ],
  interfaces: ['eip-1193']
};

// Optional preferences for even better experience
const defiPreferences = {
  features: [
    RESPONDER_FEATURES.HARDWARE_WALLET,       // Enhanced security
    RESPONDER_FEATURES.DEFI_INTEGRATION       // DeFi-specific optimizations
  ]
};
```

## Since

0.1.0

## See

 - [CapabilityRequirements](../interfaces/CapabilityRequirements.md) for usage in requirements
 - [CapabilityPreferences](../interfaces/CapabilityPreferences.md) for usage in preferences
 - [ResponderFeature](../interfaces/ResponderFeature.md) for feature data structure
