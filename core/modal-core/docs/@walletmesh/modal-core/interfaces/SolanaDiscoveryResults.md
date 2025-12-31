[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SolanaDiscoveryResults

# Interface: SolanaDiscoveryResults

Solana Discovery Results
Complete results from all discovery methods

## Properties

### injectedWallets

> **injectedWallets**: [`DiscoveredSolanaWallet`](DiscoveredSolanaWallet.md)[]

Wallets discovered via window injection

***

### legacyWallets?

> `optional` **legacyWallets**: [`DiscoveredSolanaWallet`](DiscoveredSolanaWallet.md)[]

Legacy wallets (deprecated discovery methods)

***

### totalCount

> **totalCount**: `number`

Total count of discovered wallets

***

### walletStandardWallets

> **walletStandardWallets**: [`DiscoveredSolanaWallet`](DiscoveredSolanaWallet.md)[]

Wallets discovered via Wallet Standard
