# Aztec Example DApp

This is an example decentralized application (dApp) that demonstrates how to connect to an Aztec wallet using WalletMesh's cross-window communication.

## Prerequisites

- Node.js and pnpm installed
- An Aztec sandbox running locally (see parent README)
- The example-wallet project built and running

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
   pnpm dev
   ```

   The dApp will be available at http://localhost:5173

## Usage

1. First ensure the wallet is running (see example-wallet README)
2. Open the dApp at http://localhost:5173
3. Click "Connect Wallet" - this will open the wallet in a new window
4. The wallet will initialize and send a ready message
5. Once connected, you can:
   - Deploy Token and Counter contracts
   - Interact with the contracts (mint, transfer, increment, etc.)

## Architecture

The dApp uses a cross-window transport (`CrossWindowTransport`) to communicate with the wallet window using `postMessage`. The communication flow is:

1. DApp opens wallet window with `window.open()`
2. Wallet initializes and sends `wallet_ready` message
3. DApp creates transport and connects via WalletMesh
4. All subsequent communication happens through the transport

## Key Components

- `DApp.tsx` - Main dApp component with contract interaction logic
- `CrossWindowTransport.ts` - Transport implementation for cross-window communication
- Uses `AztecRouterProvider` from `@walletmesh/aztec-rpc-wallet` for wallet integration
