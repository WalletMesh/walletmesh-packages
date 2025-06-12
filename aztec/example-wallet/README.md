# Aztec Example Wallet

This is an example wallet implementation that demonstrates how to create a standalone wallet that can communicate with dApps using WalletMesh's cross-window communication.

## Prerequisites

- Node.js and pnpm installed
- An Aztec sandbox running locally (see parent README)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the project:
   ```bash
   pnpm build
   ```

3. Start the preview server:
   ```bash
   pnpm preview
   ```

   The wallet will be available at http://localhost:5174

## Usage

The wallet is designed to be opened by a dApp via `window.open()`. It will:

1. Initialize an Aztec node connection and PXE
2. Create a test account using Schnorr signatures
3. Set up a WalletRouter with approval-based permissions
4. Send a `wallet_ready` message to the opener window
5. Listen for and respond to requests from the dApp

## Architecture

The wallet uses:
- `WalletRouter` from `@walletmesh/router` to handle routing
- `createAztecWalletNode` to expose the Aztec wallet functionality
- Cross-window transport for communication with the dApp
- Approval-based permission management for sensitive operations

## Key Components

- `Wallet.tsx` - Main wallet component with Aztec initialization
- `CrossWindowTransport.ts` - Transport implementation for cross-window communication
- `ApprovalPermissionManager.tsx` - UI-based approval flow for permissions
- Middleware for:
  - Origin tracking
  - Function argument name extraction
  - Request history logging

## Permissions

The following methods require user approval:
- `aztec_getAddress`
- `aztec_getCompleteAddress`
- `aztec_proveTx`
- `aztec_sendTx`
- `aztec_simulateUtility`
- `aztec_contractInteraction`
- `aztec_wmDeployContract`
- `aztec_getPrivateEvents`
- `aztec_registerContract`
- `aztec_registerContractClass`