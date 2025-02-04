# WalletMesh Aztec RPC Wallet Library

[@walletmesh/aztec-rpc-wallet](https://github.com/WalletMesh/walletmesh-packages/tree/main/aztec/aztec-rpc-wallet) provides a type-safe RPC interface for interacting with [Aztec](https://aztec.network) wallets. It consists of three main components:

- **AztecProvider**: Client-side provider for dApps to communicate with Aztec wallets
- **AztecChainWallet**: Server-side implementation that handles RPC requests using an Aztec wallet instance
- **AztecOperationBuilder**: Fluent API for chaining multiple RPC method calls

The library is built on [@walletmesh/jsonrpc](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc#readme) and [@walletmesh/router](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/router#readme).

## Features

- Connect to multiple Aztec chains simultaneously
- Flexible chain ID support (any string with 'aztec:' prefix)
- Type-safe RPC interfaces with comprehensive TypeScript definitions
- Efficient batching of multiple method calls
- Fluent chaining API for bulk operations
- Comprehensive error handling
- Contract artifact caching
- Event handling for wallet state changes
- Serialization support for all Aztec data types
- Support for encrypted and unencrypted events/logs

## Installation

```bash
npm install @walletmesh/aztec-rpc-wallet
```

## Core RPC Methods

The library supports a comprehensive set of RPC methods:

### Chain Operations
- `aztec_connect`: Connect to Aztec chains
- `aztec_getBlock`: Get block by number
- `aztec_getBlockNumber`: Get current block number
- `aztec_getProvenBlockNumber`: Get proven block number
- `aztec_getChainId`: Get chain ID
- `aztec_getVersion`: Get protocol version
- `aztec_getNodeInfo`: Get node information
- `aztec_getPXEInfo`: Get PXE information
- `aztec_getCurrentBaseFees`: Get current base fees

### Account Operations
- `aztec_getAccount`: Get wallet's account address
- `aztec_getAddress`: Get wallet's Aztec address
- `aztec_getCompleteAddress`: Get complete address details
- `aztec_registerAccount`: Register a new account
- `aztec_getRegisteredAccounts`: Get all registered accounts

### Transaction Operations
- `aztec_sendTransaction`: Send one or more transactions
- `aztec_simulateTransaction`: Simulate transaction without executing
- `aztec_sendTx`: Send raw transaction
- `aztec_createTxExecutionRequest`: Create transaction execution request
- `aztec_proveTx`: Generate transaction proof
- `aztec_getTxEffect`: Get transaction effect
- `aztec_getTxReceipt`: Get transaction receipt

### Contract Operations
- `aztec_registerContract`: Register contract instance
- `aztec_registerContractClass`: Register contract class
- `aztec_getContracts`: Get registered contracts
- `aztec_getContractInstance`: Get contract instance details
- `aztec_getContractClass`: Get contract class details
- `aztec_getContractArtifact`: Get contract artifact
- `aztec_isContractClassPubliclyRegistered`: Check if contract class is publicly registered
- `aztec_isContractPubliclyDeployed`: Check if contract is publicly deployed
- `aztec_isContractInitialized`: Check if contract is initialized
- `aztec_getPublicStorageAt`: Get public storage value

### Authorization & Scope Management
- `aztec_setScopes`: Set authorization scopes
- `aztec_getScopes`: Get current scopes
- `aztec_addAuthWitness`: Add authorization witness
- `aztec_getAuthWitness`: Get authorization witness
- `aztec_createAuthWit`: Create authorization witness

### Notes and Events
- `aztec_getIncomingNotes`: Get incoming notes
- `aztec_addNote`: Add note
- `aztec_addNullifiedNote`: Add nullified note
- `aztec_getUnencryptedLogs`: Get unencrypted logs
- `aztec_getContractClassLogs`: Get contract class logs
- `aztec_getEncryptedEvents`: Get encrypted events
- `aztec_getUnencryptedEvents`: Get unencrypted events

### L1->L2 Bridge Operations
- `aztec_isL1ToL2MessageSynced`: Check if L1->L2 message is synced
- `aztec_getL1ToL2MembershipWitness`: Get L1->L2 membership witness

See [src/types.ts](https://github.com/WalletMesh/walletmesh-packages/blob/main/aztec/aztec-rpc-wallet/src/types.ts) for complete method definitions and parameters.

## Usage Examples

### Basic Provider Usage

```typescript
import { AztecProvider } from '@walletmesh/aztec-rpc-wallet';

// Create provider with transport
const provider = new AztecProvider(transport);

// Connect to chains
await provider.connect(['aztec:testnet', 'aztec:devnet']);

// Get account address
const address = await provider.getAccount('aztec:testnet');

// Send transaction
const txHash = await provider.sendTransaction('aztec:testnet', {
  functionCalls: [{
    contractAddress: "0x1234...",
    functionName: "transfer",
    args: [recipient, amount]
  }]
});

// Register contract
await provider.registerContract('aztec:testnet', {
  instance: contractInstance,
  artifact: contractArtifact // optional if class already registered
});

// Listen for chain connection events
provider.on('chain:connected', ({ chainId }) => {
  console.log(`Connected to chain: ${chainId}`);
});

// Listen for chain disconnection events
provider.on('chain:disconnected', ({ chainId }) => {
  console.log(`Disconnected from chain: ${chainId}`);
});
```

### Chaining API for Bulk Operations

The provider supports a fluent chaining API for executing multiple operations efficiently:

```typescript
// Multiple reads in single batch
const [account, contracts, blockNumber] = await provider
  .chain('aztec:testnet')
  .call('aztec_getAccount')
  .call('aztec_getContracts')
  .call('aztec_getBlockNumber')
  .execute();

// Contract setup and interaction
const [classId, instanceId, txHash] = await provider
  .chain('aztec:testnet')
  .call('aztec_registerContractClass', { artifact: contractArtifact })
  .call('aztec_registerContract', { 
    instance: contractInstance,
    artifact: contractArtifact
  })
  .call('aztec_sendTransaction', {
    functionCalls: [{
      contractAddress: contractInstance.address,
      functionName: 'initialize',
      args: [param1, param2]
    }]
  })
  .execute();

// Multi-chain operations
const [testnetData, devnetData] = await Promise.all([
  provider
    .chain('aztec:testnet')
    .call('aztec_getAccount')
    .call('aztec_getContracts')
    .execute(),
  provider
    .chain('aztec:devnet')
    .call('aztec_getAccount')
    .call('aztec_getContracts')
    .execute()
]);
```

### Error Handling

The library provides comprehensive error handling through `AztecWalletError`:

```typescript
try {
  await provider.sendTransaction('aztec:testnet', {
    functionCalls: [{
      contractAddress: "0x1234...",
      functionName: "transfer",
      args: [recipient, amount]
    }]
  });
} catch (error) {
  if (error instanceof AztecWalletError) {
    switch (error.code) {
      case -32001: // User refused
        console.log('Transaction rejected by user');
        break;
      case -32002: // Wallet not connected
        console.log('Please connect wallet first');
        break;
      default:
        console.error('RPC error:', error.message);
    }
  }
}
```

### Implementing a Wallet

Server-side implementation using `AztecWallet`:

```typescript
import { AztecChainWallet } from '@walletmesh/aztec-rpc-wallet';
import type { PXE, AccountWallet } from '@aztec/aztec.js';

// Create wallet instance
const wallet = new AztecChainWallet(
  pxe,           // PXE instance
  accountWallet, // Aztec AccountWallet instance
  transport     // Transport layer
);

// Handle incoming requests
transport.on('message', async (request) => {
  const response = await wallet.handleRequest(request);
  // Send response back to dApp
});

// Use with WalletMesh router
const routerClient = wallet.asWalletRouterClient();
```

## Error Codes

Common error codes returned by the library:

- -32000: Unknown internal error
- -32001: User refused transaction
- -32002: Wallet not connected
- -32003: Contract instance not registered
- -32004: Contract class not registered
- -32005: Sender not registered
- -32006: Invalid response format
- -32007: Not connected to any chain
- -32008: Chain not supported
- -32009: Invalid request format
- -32010: Invalid parameters
- -32011: Permission denied
- -32012: Session not found
- -32013: Session expired
- -32014: Transaction not found
- -32015: Block not found
- -32016: Authorization witness not found

## Example Project

See the [example project](https://github.com/WalletMesh/walletmesh-packages/tree/main/aztec/example) for a complete implementation using this library.
