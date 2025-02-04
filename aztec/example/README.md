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

```bash
pnpm dev
```

## Components Overview

### Sandbox

The sandbox directory contains the docker-compose configuration for the Aztec Sandbox with a deployed
account for testing and a token contract and counter contract for the DApp to interact with.

### DApp Component

[src/components/DApp.tsx](./src/components/DApp.tsx)

The DApp component represents a sample decentralized application that uses the Aztec Provider.
It demonstrates how to perform transaction using Aztec contract artifacts, for example:

```js
// snippet from DApp.tsx
const mintTokens = () => {
  if (client) {
    // mint_to_public(to: AztecAddress, amount: Field)
    const functionAbi: FunctionAbi = getFunctionArtifact(TokenContractArtifact, 'mint_to_public');
    const args = [account, 10000000000000000000000];
    client.sendTransaction(TOKEN_CONTRACT, functionAbi, args).then((transactionHash) => {
      console.log('Mint transaction sent, hash:', transactionHash);
    }).catch((error) => {
      window.alert(`Transaction failed: ${error.message}`);
    });
  }
}
```

### Wallet Component

[src/components/Wallet.tsx](./src/components/Wallet.tsx)

The Wallet component simulates a basic Aztec Wallet that can be used to transact on Aztec.
The middleware component enables the Wallet to prompt the user for approval for each request
from the DApp.
