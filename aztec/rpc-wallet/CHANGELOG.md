# @walletmesh/aztec-rpc-wallet

## 0.5.7

### Patch Changes

- 59804ec: Update all packages for aztec2
- Updated dependencies [59804ec]
  - @walletmesh/jsonrpc@0.5.4
  - @walletmesh/router@0.5.4

## 0.5.6

### Patch Changes

- 3bbe9b2: Add modal-core and modal-react packages
- Updated dependencies [3bbe9b2]
  - @walletmesh/jsonrpc@0.5.3
  - @walletmesh/router@0.5.3

## 0.5.4

### Patch Changes

- 441c37c: fix build/tests
- 1dd69e8: Update aztec packages to 2.0.3

## 0.5.0

### Minor Changes

- 251cbea: upgade aztec packages to v1.2.1

## 0.4.1

### Patch Changes

- c22c977: Minor build fixes

## 0.4.0

### Minor Changes

- cb714b7: This release marks a major architectural overhaul of the Aztec RPC wallet to provide a more robust, secure, and developer-friendly integration with `aztec.js`.

  - **BREAKING CHANGE**: The previous `AztecChainWallet` and `AztecProvider` classes have been removed.
  - Introduced `AztecDappWallet`, a new client-side `Wallet` implementation that conforms to the standard `aztec.js` interface, ensuring seamless integration with the Aztec ecosystem.
  - Added `createAztecWalletNode`, a new server-side factory for creating a `JSONRPCNode` that serves an `AccountWallet` instance.
  - Introduced `connectAztec` and `createAztecWallet` helpers to simplify dApp connection and initialization flows.
  - Added high-level `wmExecuteTx` and `wmDeployContract` methods to `AztecDappWallet`, which provide the wallet with more transaction context for improved security and user experience.
  - Introduced `AztecRouterProvider`, which extends the base `WalletRouterProvider` to automatically handle serialization for all Aztec-specific types.

### Patch Changes

- Updated dependencies [cb714b7]
- Updated dependencies [cb714b7]
  - @walletmesh/jsonrpc@0.5.0
  - @walletmesh/router@0.5.0

## 0.3.1

### Patch Changes

- 65bc501: aztec-packages -> 0.76.2

## 0.3.0

### Minor Changes

- 937a416: Update to aztec-packages 0.73.0 & serializers turning async

### Patch Changes

- Updated dependencies [937a416]
  - @walletmesh/jsonrpc@0.4.0
  - @walletmesh/router@0.4.0

## 0.2.0

### Minor Changes

- 8bd3463: chore: Add aztec-specific packages to the monorepo & rename the git repository

### Patch Changes

- Updated dependencies [8bd3463]
  - @walletmesh/jsonrpc@0.3.0
  - @walletmesh/router@0.3.0

## 0.1.1

### Patch Changes

- ae7ef37: Aztec Packages update to 0.72.1 & refactor a bunch of aztec-rpc-wallet serializers

## 0.1.0

### Minor Changes

- 0597281: Overhaul of (formerly) @walletmesh/aztec-rpc & rename to @walletmesh/aztec-rpc-wallet
