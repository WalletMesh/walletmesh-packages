# Migration Guide: From Direct Aztec SDK to WalletMesh

This guide helps developers migrate from using the Aztec SDK directly to the simplified WalletMesh modal-react package.

## Overview of Changes

The WalletMesh modal-react package provides a significant improvement in developer experience by:

- Eliminating type casting requirements
- Reducing boilerplate code by 40-50%
- Providing automatic state management
- Adding built-in error handling
- Simplifying wallet connection flows

## Side-by-Side Comparison

### Wallet Connection

#### Before (Direct SDK)
```tsx
import { createPXEClient, createAccount } from '@aztec/aztec.js';

// Manual wallet setup
const pxe = createPXEClient(RPC_URL);
const wallet = await createAccount(pxe);

// Type casting nightmare
const aztecWallet = wallet as unknown as Parameters<typeof Contract.at>[2];

// Manual connection state management
const [isConnecting, setIsConnecting] = useState(false);
const [isConnected, setIsConnected] = useState(false);
const [error, setError] = useState(null);

const connect = async () => {
  setIsConnecting(true);
  try {
    const wallet = await createAccount(pxe);
    setIsConnected(true);
  } catch (err) {
    setError(err);
  } finally {
    setIsConnecting(false);
  }
};
```

#### After (WalletMesh)
```tsx
import { useAztecWallet, AztecConnectButton } from '@walletmesh/modal-react/aztec';

// Automatic wallet management
const { aztecWallet, isReady, status, error } = useAztecWallet();

// Pre-built connect button with state management
<AztecConnectButton showProvingStatus={true} />
```

### Contract Deployment

#### Before (Direct SDK)
```tsx
// Manual deployment with complex error handling
const [isDeploying, setIsDeploying] = useState(false);
const [deployedAddress, setDeployedAddress] = useState(null);

const deployContract = async () => {
  setIsDeploying(true);
  try {
    const wallet = accountManager.getWallet() as unknown as AccountWalletWithSecretKey;
    const instance = await TokenContract.deploy(
      wallet,
      owner,
      name,
      symbol,
      decimals
    ).send().deployed();

    setDeployedAddress(instance.address);

    // Manual contract registration
    await pxe.addContracts([
      {
        artifact: TokenContractArtifact,
        instance: {
          address: instance.address,
        },
      },
    ]);
  } catch (error) {
    console.error('Deployment failed:', error);
    showError(`Deployment failed: ${error.message}`);
  } finally {
    setIsDeploying(false);
  }
};
```

#### After (WalletMesh)
```tsx
import { useAztecDeploy } from '@walletmesh/modal-react/aztec';

// Simplified deployment with automatic state management
const { deploy, isDeploying, deployedAddress, stage } = useAztecDeploy();

const handleDeploy = async () => {
  await deploy(
    TokenContractArtifact,
    [owner, name, symbol, decimals],
    {
      onSuccess: (addr) => console.log(`Deployed at ${addr}`),
      onError: (err) => console.error(`Failed: ${err.message}`),
    }
  );
};
```

### Contract Interactions

#### Before (Direct SDK)
```tsx
// Complex contract interaction with manual type casting
const mintTokens = async () => {
  if (!tokenContract) return;

  try {
    const wallet = aztecWallet as unknown as Parameters<typeof Contract.at>[2];
    const contract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);

    // Manual transaction building and sending
    const interaction = contract.methods.mint_to_public(address, amount);
    const txReceipt = await interaction.send().wait();

    if (txReceipt.status !== 'SUCCESS') {
      throw new Error('Transaction failed');
    }

    showSuccess('Tokens minted successfully');
  } catch (error) {
    showError(`Minting failed: ${error.message}`);
  }
};

// Reading contract state
const checkBalance = async () => {
  try {
    const wallet = aztecWallet as unknown as Parameters<typeof Contract.at>[2];
    const contract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
    const balance = await contract.methods.balance_of_public(address).simulate();
    showInfo(`Balance: ${balance}`);
  } catch (error) {
    showError(`Balance check failed: ${error.message}`);
  }
};
```

#### After (WalletMesh)
```tsx
import { useAztecContract, useAztecTransaction } from '@walletmesh/modal-react/aztec';

// Simplified contract interaction
const tokenContract = useAztecContract(tokenAddress, TokenContractArtifact);
const { execute } = useAztecTransaction();

// No type casting needed!
const mintTokens = async () => {
  await execute(
    async () => tokenContract.contract.methods.mint_to_public(address, amount),
    {
      onSuccess: () => showSuccess('Tokens minted'),
      onError: (err) => showError(`Failed: ${err.message}`),
    }
  );
};

// Simplified reads
const checkBalance = async () => {
  const balance = await tokenContract.simulate(
    tokenContract.contract.methods.balance_of_public(address)
  );
  showInfo(`Balance: ${balance}`);
};
```

### Transaction Management

#### Before (Direct SDK)
```tsx
// Manual transaction state management
const [txStatus, setTxStatus] = useState('idle');
const [provingProgress, setProvingProgress] = useState(0);

const sendTransaction = async () => {
  setTxStatus('preparing');

  try {
    const interaction = contract.methods.transfer(to, amount);

    // Simulate proving progress manually
    setTxStatus('proving');
    const progressInterval = setInterval(() => {
      setProvingProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    setTxStatus('sending');
    const sentTx = await interaction.send();

    setTxStatus('confirming');
    clearInterval(progressInterval);
    setProvingProgress(100);

    const receipt = await sentTx.wait();

    if (receipt.status !== 'SUCCESS') {
      throw new Error('Transaction failed');
    }

    setTxStatus('success');
    showSuccess('Transaction successful');
  } catch (error) {
    setTxStatus('error');
    showError(`Transaction failed: ${error.message}`);
  }
};
```

#### After (WalletMesh)
```tsx
import { useAztecTransaction } from '@walletmesh/modal-react/aztec';

// Automatic transaction state management
const { execute, status, provingProgress, isExecuting } = useAztecTransaction();

const sendTransaction = async () => {
  await execute(
    async (wallet) => {
      const contract = await Contract.at(address, artifact, wallet);
      return contract.methods.transfer(to, amount);
    },
    {
      onProvingProgress: (progress) => console.log(`Proving: ${progress}%`),
      onSuccess: () => showSuccess('Transaction successful'),
      onError: (err) => showError(`Failed: ${err.message}`),
    }
  );
};

// UI automatically updates based on status
{status === 'proving' && <progress value={provingProgress} max={100} />}
```

### Wallet State Guards

#### Before (Direct SDK)
```tsx
// Manual wallet state checking
function ProtectedComponent({ children }) {
  const [wallet, setWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Manual initialization check
    checkWalletConnection();
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isConnecting) {
    return <div>Connecting to wallet...</div>;
  }

  if (!wallet) {
    return <div>Please connect your wallet</div>;
  }

  return children;
}
```

#### After (WalletMesh)
```tsx
import { AztecWalletReady } from '@walletmesh/modal-react/aztec';

// Automatic wallet state handling
<AztecWalletReady
  fallback={<div>Please connect your wallet</div>}
  connectingFallback={<div>Connecting to Aztec...</div>}
  errorFallback={(error) => <div>Error: {error.message}</div>}
>
  {children}
</AztecWalletReady>
```

## Migration Steps

### Step 1: Install WalletMesh

```bash
npm install @walletmesh/modal-react
```

### Step 2: Wrap Your App

Replace manual PXE client setup with the WalletMeshProvider:

```tsx
// Remove this
const pxe = createPXEClient(RPC_URL);

// Add this
import { AztecWalletMeshProvider } from '@walletmesh/modal-react/aztec';

<AztecWalletMeshProvider
  config={{
    appName: 'Your App',
    chains: [{ chainId: 'aztec:31337' }],
    permissions: ['aztec_getAddress', 'aztec_sendTx', /* ... */],
  }}
>
  <App />
</AztecWalletMeshProvider>
```

### Step 3: Replace Direct SDK Calls

#### Replace Wallet Creation
```tsx
// Old
const wallet = await createAccount(pxe);

// New
const { aztecWallet } = useAztecWallet();
```

#### Replace Contract Deployment
```tsx
// Old
const instance = await Contract.deploy(wallet, ...args).send().deployed();

// New
const { deploy } = useAztecDeploy();
await deploy(artifact, args);
```

#### Replace Contract Interactions
```tsx
// Old
const contract = await Contract.at(address, artifact, wallet);
await contract.methods.someMethod(...args).send().wait();

// New
const contract = useAztecContract(address, artifact);
const { execute } = useAztecTransaction();
await execute(() => contract.contract.methods.someMethod(...args));
```

### Step 4: Update UI Components

Replace manual connection UI with pre-built components:

```tsx
// Old
<button onClick={connectWallet} disabled={isConnecting}>
  {isConnecting ? 'Connecting...' : 'Connect'}
</button>

// New
<AztecConnectButton showProvingStatus={true} />
```

### Step 5: Simplify Error Handling

Remove try-catch blocks and use callbacks:

```tsx
// Old
try {
  const result = await someOperation();
  handleSuccess(result);
} catch (error) {
  handleError(error);
}

// New
await execute(someOperation, {
  onSuccess: handleSuccess,
  onError: handleError,
});
```

## Common Patterns

### Pattern 1: Multiple Contract Deployments

```tsx
// Use multiple deployment hooks for different contracts
const tokenDeploy = useAztecDeploy();
const counterDeploy = useAztecDeploy();

// Deploy independently
await tokenDeploy.deploy(TokenArtifact, tokenArgs);
await counterDeploy.deploy(CounterArtifact, counterArgs);
```

### Pattern 2: Batch Operations

```tsx
const { execute } = useAztecTransaction();

// Execute multiple operations in one transaction
await execute(async (wallet) => {
  const contract = await Contract.at(address, artifact, wallet);
  return contract.methods.batchTransfer(recipients, amounts);
});
```

### Pattern 3: Progress Tracking

```tsx
const { status, provingProgress } = useAztecTransaction();

// Show detailed progress UI
{status === 'preparing' && <p>Preparing transaction...</p>}
{status === 'proving' && (
  <div>
    <p>Generating zero-knowledge proof...</p>
    <progress value={provingProgress} max={100} />
  </div>
)}
{status === 'sending' && <p>Sending to network...</p>}
{status === 'confirming' && <p>Confirming on-chain...</p>}
```

## Benefits Summary

### Code Reduction
- **Before**: ~489 lines for basic DApp
- **After**: ~280 lines (43% reduction)

### Type Safety
- No more `as unknown as` type casting
- Full TypeScript support with proper inference

### State Management
- Automatic loading states
- Built-in error handling
- Progress tracking included

### Developer Experience
- Intuitive hook-based API
- Pre-built UI components
- Clear separation of concerns

## Troubleshooting Migration

### Issue: Type errors after migration
**Solution**: Remove all type casting. The hooks provide proper types automatically.

### Issue: Missing wallet instance
**Solution**: Use `useAztecWallet()` hook instead of manual wallet creation.

### Issue: Transaction failures
**Solution**: Use the `onError` callback to handle errors gracefully.

### Issue: UI not updating
**Solution**: Use the status values from hooks instead of manual state.

## Getting Help

- [Documentation](./AZTEC_DEVELOPER_GUIDE.md)
- [Example DApp](https://github.com/WalletMesh/walletmesh/tree/main/aztec/example-dapp)
- [GitHub Issues](https://github.com/WalletMesh/walletmesh/issues)