# Adapter vs Provider Architecture

## Overview

WalletMesh Modal Core uses a two-layer architecture to separate concerns between wallet connection (Adapters) and blockchain interaction (Providers). This document explains the distinction and relationship between these two critical components.

## The Two Layers

### 1. Adapters - Connection Layer
**Purpose**: Handle HOW to connect to specific wallet implementations

Adapters are responsible for:
- Wallet discovery and detection
- Establishing communication channels (popup windows, browser extensions, mobile apps)
- Managing transport mechanisms (CrossWindowTransport, ExtensionTransport, etc.)
- Handling wallet-specific connection flows and quirks
- Session management and persistence
- Connection state management

**Examples**: 
- `MetaMaskAdapter` - Knows how to connect to MetaMask extension
- `PhantomAdapter` - Knows how to connect to Phantom wallet
- `AztecExampleWalletAdapter` - Knows how to connect to Aztec sandbox wallet

### 2. Providers - API Layer
**Purpose**: Provide the programming interface for blockchain operations

Providers are responsible for:
- Implementing blockchain-specific standards (EIP-1193 for EVM, Solana Wallet Standard, etc.)
- Exposing methods for blockchain operations (`sendTransaction`, `signMessage`, `getBalance`)
- Handling blockchain-specific data serialization
- Managing blockchain state (accounts, chain ID, etc.)
- Abstracting the blockchain protocol for dApp developers

**Examples**:
- `EvmProvider` - Implements EIP-1193 standard for Ethereum/EVM chains
- `SolanaProvider` - Implements Solana Wallet Standard
- `AztecProvider` - Implements Aztec-specific wallet interface

## Architecture Flow

```
┌──────────────┐
│ dApp Developer│
└──────┬───────┘
       │ Uses standard API
       ▼
┌──────────────┐
│   Provider   │ ← Blockchain API (sendTransaction, signMessage, etc.)
└──────┬───────┘
       │ Created with transport by
       ▼
┌──────────────┐
│   Adapter    │ ← Connection logic (popup, extension, mobile)
└──────┬───────┘
       │ Communicates via
       ▼
┌──────────────┐
│  Transport   │ ← Communication channel (JSON-RPC, PostMessage, etc.)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Wallet    │ ← Actual wallet implementation
└──────────────┘
```

## Why Both Are Needed

### Separation of Concerns

**Without separation (Bad)**:
```typescript
// Every wallet would need to reimplement blockchain methods
class MetaMaskWallet {
  connect() { /* MetaMask-specific connection */ }
  sendTransaction() { /* EVM transaction logic */ }
  signMessage() { /* EVM signing logic */ }
  // Duplicate EVM logic in every EVM wallet!
}
```

**With separation (Good)**:
```typescript
// Adapter handles connection
class MetaMaskAdapter {
  connect() { 
    // MetaMask-specific connection logic
    const transport = await this.establishConnection();
    // Create standard EVM provider with transport
    return new EvmProvider(transport);
  }
}

// Provider handles blockchain operations (reusable!)
class EvmProvider {
  sendTransaction() { /* Standard EVM logic */ }
  signMessage() { /* Standard EVM logic */ }
}
```

### Benefits

1. **Code Reuse**: Multiple wallets can use the same provider implementation
2. **Standards Compliance**: Providers cleanly implement blockchain standards
3. **Flexibility**: New wallets only need new adapters, can reuse existing providers
4. **Clear Responsibilities**: Each layer has a single, well-defined purpose
5. **Easier Testing**: Can test connection logic separately from blockchain logic

## Real-World Example

```typescript
// 1. User selects MetaMask in the modal
const adapter = new MetaMaskAdapter();

// 2. Adapter handles MetaMask-specific connection
const connection = await adapter.connect();
// - Detected MetaMask extension
// - Requested account access
// - Established transport channel
// - Created EVM provider with that transport

// 3. dApp uses standard provider interface
const provider = connection.provider; // This is an EvmProvider instance

// 4. Provider handles blockchain operations
const accounts = await provider.getAccounts();
const txHash = await provider.sendTransaction({
  from: accounts[0],
  to: '0x...',
  value: '1000000000000000000'
});
```

## Key Relationships

### Adapter Creates Provider
The adapter is responsible for:
1. Establishing the transport/connection to the wallet
2. Creating the appropriate provider WITH that transport
3. Returning the provider for dApp use

This is why you see `createProvider` methods in adapters - they're not subordinate, they're factory methods that wire up the provider with the established transport.

### Provider Uses Transport
The provider doesn't know HOW to connect to a wallet, it only knows:
1. How to send blockchain-specific requests over a transport
2. How to handle blockchain-specific responses
3. How to implement the blockchain's standard interface

## Common Patterns

### Multi-Chain Wallets
Some wallets support multiple blockchains. The adapter can create different providers based on the chain:

```typescript
class MultiChainAdapter extends AbstractWalletAdapter {
  async connect(chainType: ChainType) {
    const transport = await this.establishConnection();
    
    switch(chainType) {
      case ChainType.Evm:
        return new EvmProvider(transport);
      case ChainType.Solana:
        return new SolanaProvider(transport);
      default:
        throw new Error('Unsupported chain');
    }
  }
}
```

### Discovered Wallets
When wallets are discovered dynamically, generic adapters can be configured:

```typescript
// Discovery finds a wallet
const discoveredWallet = {
  name: 'Unknown EVM Wallet',
  provider: window.ethereum // The actual provider object
};

// Generic adapter configured with discovered wallet
const adapter = new EvmAdapter({
  name: discoveredWallet.name,
  provider: discoveredWallet.provider
});
```

## Summary

- **Adapters** = Connection specialists (know HOW to connect to wallets)
- **Providers** = API specialists (know HOW to interact with blockchains)
- Together they provide a clean, modular architecture for wallet integration
- This separation enables code reuse, standards compliance, and clear responsibilities