---
"@walletmesh/aztec-rpc-wallet": minor
---

This release marks a major architectural overhaul of the Aztec RPC wallet to provide a more robust, secure, and developer-friendly integration with `aztec.js`.

-   **BREAKING CHANGE**: The previous `AztecChainWallet` and `AztecProvider` classes have been removed.
-   Introduced `AztecDappWallet`, a new client-side `Wallet` implementation that conforms to the standard `aztec.js` interface, ensuring seamless integration with the Aztec ecosystem.
-   Added `createAztecWalletNode`, a new server-side factory for creating a `JSONRPCNode` that serves an `AccountWallet` instance.
-   Introduced `connectAztec` and `createAztecWallet` helpers to simplify dApp connection and initialization flows.
-   Added high-level `wmExecuteTx` and `wmDeployContract` methods to `AztecDappWallet`, which provide the wallet with more transaction context for improved security and user experience.
-   Introduced `AztecRouterProvider`, which extends the base `WalletRouterProvider` to automatically handle serialization for all Aztec-specific types.
