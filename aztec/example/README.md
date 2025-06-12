## Example for WalletMesh Aztec Provider & Wallet RPC

This repository contains an example DApp and Wallet that demonstrate how to use
[@walletmesh/aztec](https://github.com/WalletMesh/walletmesh-packages/tree/main/packages/aztec/aztec#readme) library for
integrating DApps with Aztec Wallets.

## Setup

Before running the example DApp & Wallet, you will need to have the Aztec Sandbox running.

### Using the DevContainer (Recommended)

The recommended setup is to use the devcontainer config from `.devcontainer/example/` in
the root of this repository.  This will setup a development environment with all the required
dependencies and tools, including the Aztec sandbox.

The aztec sandbox starts with the devcontainer, so you don't need to do anything extra,
but you can manage it manually if you prefer with `docker compose`.

### Without the DevContainer

Follow Aztec's [Getting Started](https://docs.aztec.network/guides/developer_guides/getting_started)
guide to install the aztec sandbox. Be sure to check the sandbox version in this repository's
devcontainer config to ensure you've matched versions with the one required by the examples.
To start the sandbox, do NOT follow aztec's instructions, but instead run:

```bash
cd /path/to/packages/example/sandbox
docker compose up -d -f docker-compose.yaml
```

## Running the example

**Important:** Due to web worker limitations in Vite's development server, this example must be built and run using `vite preview` instead of `vite dev`.

```bash
# Build the example
pnpm build

# Run the preview server
pnpm preview
```

The application will be available at http://localhost:4173 (or the port shown in your terminal).

## Components Overview

### Sandbox

The sandbox directory contains the docker-compose configuration for the Aztec Sandbox with a deployed
account for testing and a token contract and counter contract for the DApp to interact with.

### DApp Component

[src/components/DApp.tsx](./src/components/DApp.tsx)

The DApp component represents a sample decentralized application that uses the Aztec DApp Wallet.
It demonstrates two different approaches for deploying and interacting with smart contracts:

#### Preferred Method: Token Contract (Using `wallet.wmDeployContract` and `wallet.wmExecuteContract`)

The Token contract example shows the **recommended approach** for contract deployment and interaction:

```js
// Deployment using wallet.wmDeployContract
const deploySentTx = await wallet.wmDeployContract(TokenContractArtifact, [ownerAddress, 'TokenName', 'TKN', 18]);
const token = await deploySentTx.deployed();

// Interaction using wallet.wmExecuteContract
const tokenContract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
const interaction = tokenContract.methods.mint_to_public(account, 10000000000000000000000n);
const sentTx = await wallet.wmExecuteContract(interaction);
const receipt = await sentTx.wait();
```

**Why this is preferred:** This method gives the wallet a higher-level view of the transaction, allowing it to:
- Display meaningful transaction details to the user
- Show the specific contract method being called
- Display parameter names and values in a human-readable format
- Provide better security through clearer transaction intent

#### Alternative Method: Counter Contract (Using `Contract.deploy` and `.send()`)

The Counter contract shows the alternative approach using direct contract methods:

```js
// Deployment using Contract.deploy
const deploySentTx = await Contract.deploy(wallet, CounterContractArtifact, [0, ownerAddress]).send();
const counter = await deploySentTx.deployed();

// Interaction using direct method calls
const counterContract = await Contract.at(counterAddress, CounterContractArtifact, wallet);
const tx = await counterContract.methods.increment(account, account).send();
await tx.wait();
```

While this method works, it provides less context to the wallet about what the transaction is doing.
It is included so that the AztecDAppWallet provider can implement the aztec.js `Wallet` interface.

### Wallet Component

[src/components/Wallet.tsx](./src/components/Wallet.tsx)

The Wallet component simulates a basic Aztec Wallet that can be used to transact on Aztec.
The middleware component enables the Wallet to prompt the user for approval for each request
from the DApp.
