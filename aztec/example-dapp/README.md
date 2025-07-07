# Aztec Example DApp

This is an example decentralized application (dApp) that demonstrates how to connect to an Aztec wallet using WalletMesh's cross-window communication.

## Prerequisites

- Node.js and pnpm installed
- An Aztec sandbox running locally (see parent README)
- The example-wallet project built and running

## Configuration

The dApp can be configured using environment variables:

- `VITE_WALLET_URL` - URL of the wallet application (default: `http://localhost:5174` for development)
- `VITE_NODE_URL` - URL of the Aztec sandbox node (default: `https://sandbox.aztec.walletmesh.com/api/v1/public`)
- `LOG_LEVEL` - Logging level (default: `debug`)

Environment files:
- `.env.development` - Used during local development
- `.env.production` - Used for production builds

## Getting Started

### Local Development

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

### Docker Deployment

To build and run the dApp using Docker:

1. Build the Docker image from the repository root:
   ```bash
   docker build -f aztec/example-dapp/Dockerfile -t aztec-example-dapp .
   ```

2. Run the container:
   ```bash
   docker run -p 8080:80 aztec-example-dapp
   ```

   The dApp will be available at http://localhost:8080

The Docker build uses the production environment configuration by default, which points to `https://sandbox-example-wallet.aztec.walletmesh.com` for the wallet URL.

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
