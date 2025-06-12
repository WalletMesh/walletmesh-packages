# @walletmesh/aztec-example

## 0.4.0

### Minor Changes

- cb714b7: The example application has been completely reworked to demonstrate the new `@walletmesh/aztec-rpc-wallet` architecture and best practices.

  - Updated to use `AztecDappWallet` and `AztecRouterProvider` for all wallet interactions.
  - The UI now demonstrates the preferred method for contract interaction (`wmExecuteTx`) and deployment (`wmDeployContract`), which provide better context to the wallet.
  - The local Docker-based sandbox has been removed. The example now connects to a remote public testnet node by default.
  - Added a more robust UI with loading states, toast notifications for success/error feedback, and a clearer approval flow for transaction requests.
  - Upgraded all `@aztec/*` dependencies to version `0.87.8`.

### Patch Changes

- Updated dependencies [cb714b7]
- Updated dependencies [cb714b7]
- Updated dependencies [cb714b7]
- Updated dependencies [cb714b7]
- Updated dependencies [cb714b7]
  - @walletmesh/aztec-helpers@0.4.0
  - @walletmesh/aztec-rpc-wallet@0.4.0
  - @walletmesh/aztec@0.4.0
  - @walletmesh/jsonrpc@0.5.0
  - @walletmesh/router@0.5.0
