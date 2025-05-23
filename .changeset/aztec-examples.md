---
"@walletmesh/aztec-example": minor
---

The example application has been completely reworked to demonstrate the new `@walletmesh/aztec-rpc-wallet` architecture and best practices.

-   Updated to use `AztecDappWallet` and `AztecRouterProvider` for all wallet interactions.
-   The UI now demonstrates the preferred method for contract interaction (`wmExecuteTx`) and deployment (`wmDeployContract`), which provide better context to the wallet.
-   The local Docker-based sandbox has been removed. The example now connects to a remote public testnet node by default.
-   Added a more robust UI with loading states, toast notifications for success/error feedback, and a clearer approval flow for transaction requests.
-   Upgraded all `@aztec/*` dependencies to version `0.87.8`.
