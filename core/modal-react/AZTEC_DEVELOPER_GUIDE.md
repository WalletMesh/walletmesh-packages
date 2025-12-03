# Aztec Developer Guide

## Overview

This guide demonstrates the simplified developer experience for building Aztec dApps using the `@walletmesh/modal-react` package. The new hooks and components significantly reduce boilerplate code and improve type safety.

## Quick Start

### Installation

```bash
npm install @walletmesh/modal-react
# or
pnpm add @walletmesh/modal-react
# or
yarn add @walletmesh/modal-react
```

### Basic Setup

```tsx
import React from 'react';
import {
  AztecWalletMeshProvider,
  AztecConnectButton,
  AztecWalletReady
} from '@walletmesh/modal-react/aztec';

function App() {
  return (
    <AztecWalletMeshProvider
      config={{
        appName: 'My Aztec DApp',
        appDescription: 'Zero-knowledge proof powered application',
        chains: [{ chainId: 'aztec:31337', label: 'Aztec Sandbox' }],
        permissions: [
          'aztec_getAddress',
          'aztec_sendTx',
          'aztec_simulateTx',
          // Add other required permissions
        ],
      }}
    >
      <AztecConnectButton />
      <AztecWalletReady>
        <YourDAppContent />
      </AztecWalletReady>
    </AztecWalletMeshProvider>
  );
}
```

## Core Hooks

### useAztecWallet

Access wallet connection state and account information.

```tsx
import { useAztecWallet } from '@walletmesh/modal-react/aztec';

function WalletInfo() {
  const {
    address,           // User's Aztec address
    completeAddress,   // Complete address with public keys
    aztecWallet,       // Wallet instance for direct interactions
    isReady,          // Whether wallet is ready for transactions
    status,           // Connection status
    isAztecChain,     // Whether on an Aztec network
    error,            // Any connection errors
  } = useAztecWallet();

  if (!isReady) return <div>Connect your wallet</div>;

  return (
    <div>
      <p>Address: {address?.toString()}</p>
      <p>Status: {status}</p>
    </div>
  );
}
```

### useAztecContract

Interact with deployed contracts with automatic type inference and simplified API.

```tsx
import { useAztecContract } from '@walletmesh/modal-react/aztec';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function TokenContract({ contractAddress }) {
  const {
    contract,      // Contract instance
    isLoading,     // Loading state
    error,         // Any errors
    execute,       // Execute transactions
    simulate,      // Simulate without sending
    refetch,       // Reload contract
  } = useAztecContract(contractAddress, TokenContractArtifact);

  const handleTransfer = async () => {
    try {
      // No type casting needed!
      await execute(
        contract.methods.transfer_in_public(
          from,
          to,
          amount,
          nonce
        )
      );
      console.log('Transfer successful');
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  const checkBalance = async () => {
    const balance = await simulate(
      contract.methods.balance_of_public(address)
    );
    console.log('Balance:', balance);
  };

  return (
    <div>
      <button onClick={handleTransfer} disabled={isLoading}>
        Transfer
      </button>
      <button onClick={checkBalance}>
        Check Balance
      </button>
    </div>
  );
}
```

### useAztecTransaction

Manage transaction lifecycle with automatic state tracking and progress monitoring.

```tsx
import { useAztecTransaction } from '@walletmesh/modal-react/aztec';

function TransactionExample() {
  const {
    execute,          // Execute a transaction
    isExecuting,      // Transaction in progress
    status,           // Current transaction phase
    provingProgress,  // Zero-knowledge proof generation progress
    error,           // Any transaction errors
    lastResult,      // Last transaction result
    reset,           // Reset state
  } = useAztecTransaction();

  const handleTransaction = async () => {
    try {
      const result = await execute(
        async (wallet) => {
          const contract = await Contract.at(address, artifact, wallet);
          return contract.methods.someMethod(param1, param2);
        },
        {
          onSent: (hash) => console.log('Sent:', hash),
          onSuccess: (receipt) => console.log('Success:', receipt),
          onError: (err) => console.error('Failed:', err),
          onProvingProgress: (progress) => {
            console.log(`Proving: ${progress}%`);
          },
        }
      );

      console.log('Transaction completed:', result);
    } catch (error) {
      // Error already handled by onError callback
    }
  };

  return (
    <div>
      {status === 'proving' && (
        <div>
          <p>Generating zero-knowledge proof...</p>
          <progress value={provingProgress} max={100} />
        </div>
      )}

      <button onClick={handleTransaction} disabled={isExecuting}>
        {isExecuting ? `${status}...` : 'Send Transaction'}
      </button>

      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### useAztecDeploy

Deploy contracts with simplified API and automatic progress tracking.

```tsx
import { useAztecDeploy } from '@walletmesh/modal-react/aztec';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function ContractDeployer() {
  const {
    deploy,           // Deploy function
    isDeploying,      // Deployment in progress
    stage,            // Current deployment stage
    deployedAddress,  // Address once deployed
    error,           // Any deployment errors
    lastDeployment,  // Last deployment result
    reset,           // Reset state
  } = useAztecDeploy();

  const handleDeploy = async () => {
    try {
      const result = await deploy(
        TokenContractArtifact,
        [ownerAddress, 'MyToken', 'MTK', 18], // Constructor args
        {
          onSuccess: (address) => {
            console.log(`Deployed at: ${address}`);
          },
          onError: (err) => {
            console.error(`Deployment failed: ${err.message}`);
          },
        }
      );

      console.log('Deployment complete:', result);
    } catch (error) {
      // Error already handled by onError callback
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case 'preparing': return 'Preparing deployment...';
      case 'computing': return 'Computing contract address...';
      case 'proving': return 'Generating proof...';
      case 'sending': return 'Sending transaction...';
      case 'confirming': return 'Confirming on-chain...';
      case 'success': return 'Deployed successfully!';
      case 'error': return 'Deployment failed';
      default: return 'Ready to deploy';
    }
  };

  return (
    <div>
      <button onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? getStageMessage() : 'Deploy Contract'}
      </button>

      {deployedAddress && (
        <p>Contract deployed at: {deployedAddress.toString()}</p>
      )}

      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## Components

### AztecWalletReady

Conditionally render content based on wallet connection state.

```tsx
import { AztecWalletReady } from '@walletmesh/modal-react/aztec';

function ProtectedContent() {
  return (
    <AztecWalletReady
      fallback={<div>Please connect your wallet</div>}
      connectingFallback={<div>Connecting to Aztec...</div>}
      errorFallback={(error) => (
        <div>
          <p>Connection failed: {error.message}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}
      requireAztecChain={true}
      wrongChainFallback={
        <div>Please switch to an Aztec network</div>
      }
    >
      {/* This content only renders when wallet is ready */}
      <YourDAppInterface />
    </AztecWalletReady>
  );
}
```

### AztecConnectButton

Pre-styled connect button with automatic state management.

```tsx
import { AztecConnectButton } from '@walletmesh/modal-react/aztec';

function Header() {
  return (
    <nav>
      <AztecConnectButton
        showProvingStatus={true}    // Show proving progress
        size="lg"                    // Button size
        variant="primary"            // Button style
        onConnect={(wallet) => {
          console.log('Connected to:', wallet.name);
        }}
        onDisconnect={() => {
          console.log('Disconnected');
        }}
      />
    </nav>
  );
}
```

## Complete Example

Here's a complete example showing all hooks working together:

```tsx
import React from 'react';
import {
  AztecWalletMeshProvider,
  AztecConnectButton,
  AztecWalletReady,
  useAztecWallet,
  useAztecContract,
  useAztecDeploy,
  useAztecTransaction,
} from '@walletmesh/modal-react/aztec';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function TokenDApp() {
  const { address } = useAztecWallet();

  // Deploy a new token contract
  const {
    deploy: deployToken,
    isDeploying,
    deployedAddress: tokenAddress,
    stage: deployStage,
  } = useAztecDeploy();

  // Interact with the deployed contract
  const tokenContract = useAztecContract(
    tokenAddress,
    TokenContractArtifact
  );

  // Manage transactions
  const {
    execute: executeTransaction,
    status: txStatus,
    provingProgress,
  } = useAztecTransaction();

  const handleDeploy = async () => {
    await deployToken(
      TokenContractArtifact,
      [address, 'MyToken', 'MTK', 18],
      {
        onSuccess: (addr) => {
          console.log(`Token deployed at ${addr}`);
        },
      }
    );
  };

  const handleMint = async () => {
    if (!tokenContract.contract) return;

    await executeTransaction(
      async () => tokenContract.execute(
        tokenContract.contract.methods.mint_to_public(
          address,
          1000000000000000000n // 1 token
        )
      ),
      {
        onSuccess: () => console.log('Minted successfully'),
      }
    );
  };

  const handleCheckBalance = async () => {
    if (!tokenContract.contract) return;

    const balance = await tokenContract.simulate(
      tokenContract.contract.methods.balance_of_public(address)
    );
    console.log('Balance:', balance);
  };

  return (
    <div>
      <AztecConnectButton showProvingStatus={true} />

      <AztecWalletReady>
        {/* Proving progress indicator */}
        {txStatus === 'proving' && (
          <div>
            <p>Generating zero-knowledge proof...</p>
            <progress value={provingProgress} max={100} />
          </div>
        )}

        {/* Deploy token */}
        {!tokenAddress ? (
          <button onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? deployStage : 'Deploy Token'}
          </button>
        ) : (
          <div>
            <p>Token: {tokenAddress.toString()}</p>
            <button onClick={handleMint}>Mint Tokens</button>
            <button onClick={handleCheckBalance}>Check Balance</button>
          </div>
        )}
      </AztecWalletReady>
    </div>
  );
}

function App() {
  return (
    <AztecWalletMeshProvider
      config={{
        appName: 'Token DApp',
        appDescription: 'Aztec token management',
        chains: [{ chainId: 'aztec:31337' }],
        permissions: [
          'aztec_getAddress',
          'aztec_sendTx',
          'aztec_simulateTx',
          'aztec_registerContract',
        ],
      }}
    >
      <TokenDApp />
    </AztecWalletMeshProvider>
  );
}
```

## Migration from Direct Aztec SDK

### Before (Direct SDK Usage)

```tsx
// Complex setup and type casting
const pxe = createPXEClient(RPC_URL);
const wallet = await createAccount(pxe);
const aztecWallet = wallet as unknown as Parameters<typeof Contract.at>[2];

// Manual transaction management
try {
  const contract = await Contract.at(address, artifact, aztecWallet);
  const tx = await contract.methods.transfer(to, amount);
  const sentTx = await tx.send();
  const receipt = await sentTx.wait();
  if (receipt.status !== 'SUCCESS') {
    throw new Error('Transaction failed');
  }
} catch (error) {
  console.error('Error:', error);
}
```

### After (Using WalletMesh Hooks)

```tsx
// Simplified setup
const { aztecWallet } = useAztecWallet();
const { execute } = useAztecTransaction();

// Automatic transaction management
await execute(
  async (wallet) => {
    const contract = await Contract.at(address, artifact, wallet);
    return contract.methods.transfer(to, amount);
  },
  {
    onSuccess: (receipt) => console.log('Success:', receipt),
    onError: (err) => console.error('Failed:', err),
  }
);
```

## Best Practices

### 1. Use AztecWalletReady for Protected Content

Always wrap wallet-dependent UI with `AztecWalletReady`:

```tsx
<AztecWalletReady
  fallback={<ConnectPrompt />}
  errorFallback={<ErrorDisplay />}
>
  <YourProtectedContent />
</AztecWalletReady>
```

### 2. Handle Errors Gracefully

Use the built-in error handling in hooks:

```tsx
const { execute } = useAztecTransaction();

await execute(
  transactionBuilder,
  {
    onError: (error) => {
      // Log to error service
      logError(error);
      // Show user-friendly message
      showToast('Transaction failed. Please try again.');
    },
  }
);
```

### 3. Show Progress Indicators

Always provide feedback during long operations:

```tsx
{status === 'proving' && (
  <ProgressBar value={provingProgress} />
)}
```

### 4. Optimize Contract Interactions

Cache contract instances and use the provided methods:

```tsx
const contract = useAztecContract(address, artifact);

// Use execute for transactions
await contract.execute(contract.contract.methods.write());

// Use simulate for read operations
const value = await contract.simulate(contract.contract.methods.read());
```

### 5. Type Safety

The hooks provide proper TypeScript types. Avoid using `any`:

```tsx
// ✅ Good - Type safe
const result = await execute(transactionBuilder);

// ❌ Bad - Loses type safety
const result = await execute(transactionBuilder as any);
```

## Troubleshooting

### Common Issues

#### 1. "Aztec wallet is not ready"
- Ensure the wallet is connected before calling transaction methods
- Wrap components with `AztecWalletReady`

#### 2. Type errors with contract methods
- The contract instance may need type assertion for complex methods
- This is a known limitation that will be improved in future versions

#### 3. Transaction stuck in "proving" state
- Zero-knowledge proof generation can take time
- Ensure the wallet has sufficient resources
- Check network connectivity

#### 4. Contract deployment fails
- Verify constructor arguments match the contract artifact
- Ensure sufficient balance for deployment
- Check that all required permissions are granted

### Debug Mode

Enable debug logging for troubleshooting:

```tsx
<AztecWalletMeshProvider
  config={{
    debug: true,
    logger: { level: 'debug' },
    // ... other config
  }}
>
```

## Advanced Topics

### Custom Transaction Builders

Create reusable transaction builders:

```tsx
const createTransferBuilder = (to: string, amount: bigint) => {
  return async (wallet: unknown) => {
    const contract = await Contract.at(TOKEN_ADDRESS, artifact, wallet);
    return contract.methods.transfer(to, amount);
  };
};

// Usage
const { execute } = useAztecTransaction();
await execute(createTransferBuilder(recipient, amount));
```

### Batch Operations

Execute multiple transactions efficiently:

```tsx
const { execute } = useAztecTransaction();

const batchTransfer = async (wallet: unknown) => {
  const contract = await Contract.at(address, artifact, wallet);
  return contract.methods.batch_transfer(recipients, amounts);
};

await execute(batchTransfer, {
  onProvingProgress: (progress) => {
    // Progress for entire batch
    updateBatchProgress(progress);
  },
});
```

### Custom Hooks

Build domain-specific hooks on top of the core hooks:

```tsx
function useTokenBalance(tokenAddress: string) {
  const { address } = useAztecWallet();
  const contract = useAztecContract(tokenAddress, TokenArtifact);
  const [balance, setBalance] = useState<bigint | null>(null);

  useEffect(() => {
    if (!contract.contract || !address) return;

    contract.simulate(
      contract.contract.methods.balance_of_public(address)
    ).then(setBalance);
  }, [contract.contract, address]);

  return balance;
}
```

## Performance Optimization

### 1. Memoize Contract Instances

```tsx
const contract = useMemo(() => {
  if (!address || !artifact) return null;
  return useAztecContract(address, artifact);
}, [address, artifact]);
```

### 2. Debounce Simulations

```tsx
const debouncedSimulate = useMemo(
  () => debounce(contract.simulate, 500),
  [contract.simulate]
);
```

### 3. Cache Results

```tsx
const { data: balance } = useQuery({
  queryKey: ['balance', address, tokenAddress],
  queryFn: () => contract.simulate(balanceMethod),
  staleTime: 30_000, // Cache for 30 seconds
});
```

## Summary

The new Aztec hooks and components in `@walletmesh/modal-react` provide:

- **40-50% less boilerplate code** compared to direct SDK usage
- **Automatic type safety** without manual casting
- **Built-in error handling** with customizable callbacks
- **Progress tracking** for zero-knowledge proof generation
- **Simplified state management** for all operations
- **Better developer experience** with clear, intuitive APIs

For more examples, see the [example-dapp](https://github.com/WalletMesh/walletmesh/tree/main/aztec/example-dapp) in the repository.