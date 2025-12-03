# Public/Private Provider Pattern Guide

This guide explains the new public/private provider pattern in WalletMesh, inspired by wagmi's architecture. This pattern separates read operations (using dApp RPC) from write operations (using wallet RPC), giving you better control over infrastructure and costs.

## Overview

WalletMesh now provides two types of providers:

- **Public Providers**: Use dApp-specified RPC endpoints for read operations
- **Wallet Providers**: Use wallet RPC endpoints for write operations

This separation allows you to:
- Control infrastructure costs by using your own RPC endpoints for reads
- Ensure secure transaction signing through wallet providers
- Optimize performance with dedicated read infrastructure
- Scale read operations independently from write operations

### Automatic Fallback

When no dApp RPC endpoints are configured for a chain, the public provider will automatically fallback to using the wallet provider's RPC (if connected), but only for read-only operations. This ensures your dApp works out of the box while still maintaining security.

## Basic Usage

### Reading Blockchain Data (Public Provider)

Use `usePublicProvider` for all read-only operations:

```tsx
import { usePublicProvider } from '@walletmesh/modal-react';

function BlockNumber() {
  const { provider, isAvailable } = usePublicProvider();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!isAvailable || !provider) return;

    const fetchBlockNumber = async () => {
      const block = await provider.request({
        method: 'eth_blockNumber'
      });
      setBlockNumber(parseInt(block as string, 16));
    };

    fetchBlockNumber();
    const interval = setInterval(fetchBlockNumber, 12000);
    return () => clearInterval(interval);
  }, [provider, isAvailable]);

  if (!isAvailable) return <div>No provider available</div>;
  return <div>Block: {blockNumber}</div>;
}
```

### Sending Transactions (Wallet Provider)

Use `useWalletProvider` for operations requiring user approval:

```tsx
import { useWalletProvider, usePublicProvider } from '@walletmesh/modal-react';

function SendTransaction() {
  const { provider: walletProvider } = useWalletProvider();
  const { provider: publicProvider } = usePublicProvider();

  const sendETH = async () => {
    if (!walletProvider || !publicProvider) return;

    // Use public provider for gas estimation (read operation)
    const gasPrice = await publicProvider.request({
      method: 'eth_gasPrice'
    });

    // Use wallet provider for sending transaction (write operation)
    const txHash = await walletProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E3D2',
        value: '0x' + (1e16).toString(16), // 0.01 ETH
        gasPrice
      }]
    });

    console.log('Transaction sent:', txHash);
  };

  return (
    <button onClick={sendETH}>
      Send 0.01 ETH
    </button>
  );
}
```

## Advanced Patterns

### Multi-Chain Support

Both hooks support querying specific chains:

```tsx
function MultiChainBalance() {
  // Get providers for specific chains
  const ethereumPublic = usePublicProvider('1');
  const polygonPublic = usePublicProvider('137');
  
  const checkBalance = async (provider: PublicProvider, address: string) => {
    if (!provider) return '0';
    
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    return balance;
  };

  // ... rest of component
}
```

### Contract Interactions

```tsx
function ContractInteraction() {
  const { provider: publicProvider } = usePublicProvider();
  const { provider: walletProvider } = useWalletProvider();

  // Read contract state with public provider
  const readContract = async () => {
    if (!publicProvider) return;

    const data = await publicProvider.request({
      method: 'eth_call',
      params: [{
        to: '0xContractAddress',
        data: '0xMethodSelector' // encoded function call
      }, 'latest']
    });

    return data;
  };

  // Write to contract with wallet provider
  const writeContract = async () => {
    if (!walletProvider) return;

    const txHash = await walletProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: '0xContractAddress',
        data: '0xMethodSelector', // encoded function call
        gas: '0x30000'
      }]
    });

    return txHash;
  };

  return (
    <div>
      <button onClick={readContract}>Read Contract</button>
      <button onClick={writeContract}>Write Contract</button>
    </div>
  );
}
```

### Message Signing

```tsx
function MessageSigner() {
  const { provider, walletId } = useWalletProvider();
  const [signature, setSignature] = useState<string>('');

  const signMessage = async () => {
    if (!provider) return;

    const accounts = await provider.getAccounts();
    if (!accounts[0]) return;

    const message = 'Hello Web3!';
    const sig = await provider.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    });

    setSignature(sig as string);
  };

  return (
    <div>
      <button onClick={signMessage}>
        Sign Message with {walletId}
      </button>
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}
```

## Configuration

### Setting up dApp RPC URLs (Optional)

Configure your dApp RPC endpoints when initializing WalletMesh. If you don't configure RPC URLs, the public provider will automatically use the wallet's RPC for read operations:

```tsx
import { WalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider config={{
      appName: 'My DApp',
      chains: [
        {
          chainId: '1',
          chainType: 'evm',
          name: 'Ethereum',
          // Configure dApp RPC endpoints for public provider
          dappRpcUrls: [
            'https://your-primary-node.com/rpc',
            'https://your-backup-node.com/rpc'
          ],
          dappRpcConfig: {
            timeout: 30000,
            retries: 3,
            loadBalance: true
          }
        },
        {
          chainId: '137',
          chainType: 'evm',
          name: 'Polygon',
          dappRpcUrls: [
            'https://polygon-rpc.com',
            'https://rpc-mainnet.matic.network'
          ]
        }
      ]
    }}>
      <YourApp />
    </WalletMeshProvider>
  );
}
```

### Fallback Behavior

When you don't specify `dappRpcUrls` for a chain:

```tsx
// No dappRpcUrls configured - will use wallet RPC fallback
const config = {
  appName: 'My DApp',
  chains: [
    {
      chainId: '1',
      chainType: 'evm',
      name: 'Ethereum',
      // No dappRpcUrls - public provider will use wallet RPC
    }
  ]
};

function MyComponent() {
  const { provider } = usePublicProvider();
  
  // This will work even without dApp RPC configured
  // It will use the wallet's RPC for read operations only
  const balance = await provider?.request({
    method: 'eth_getBalance',
    params: [address, 'latest']
  });
}
```

**Important Notes about Fallback:**
- Only read-only methods are allowed through the fallback
- Write operations (like `eth_sendTransaction`) are blocked for security
- The fallback only works when a wallet is connected on that chain
- You'll see a log message when fallback is being used

## Hook API Reference

### usePublicProvider

```typescript
function usePublicProvider(chainId?: ChainId | string): PublicProviderInfo

interface PublicProviderInfo {
  provider: PublicProvider | null;
  isAvailable: boolean;
  chainId: ChainId | null;
}

interface PublicProvider {
  request<T = unknown>(args: { 
    method: string; 
    params?: unknown[] | Record<string, unknown> 
  }): Promise<T>;
  chainId: string;
  chainType: ChainType;
}
```

### useWalletProvider

```typescript
function useWalletProvider<T extends WalletProvider = WalletProvider>(
  chainId?: ChainId | string
): WalletProviderInfo<T>

interface WalletProviderInfo<T> {
  provider: T | null;
  isAvailable: boolean;
  isConnecting: boolean;
  chainId: ChainId | null;
  chainType: ChainType | null;
  walletId: string | null;
  error: Error | null;
}

interface WalletProvider {
  getAccounts(): Promise<string[]>;
  getChainId(): Promise<string>;
  isConnected(): boolean;
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
  disconnect(): Promise<void>;
  request<T = unknown>(args: { 
    method: string; 
    params?: unknown[] | Record<string, unknown> 
  }): Promise<T>;
}
```

## Migration Guide

If you're migrating from older versions of WalletMesh, here's how to update your code:

### Before (single provider)
```tsx
function MyComponent() {
  const provider = /* some provider instance */;
  
  // All operations use the same provider
  const readData = async () => {
    const data = await provider.request({ method: 'eth_call', params: [...] });
  };
  
  const sendTx = async () => {
    const tx = await provider.request({ method: 'eth_sendTransaction', params: [...] });
  };
}
```

### After (public/private pattern)
```tsx
function MyComponent() {
  const { provider: publicProvider } = usePublicProvider();
  const { provider: walletProvider, isAvailable } = useWalletProvider();
  
  // Read operations use public provider
  const readData = async () => {
    const data = await publicProvider.request({ method: 'eth_call', params: [...] });
  };
  
  // Write operations use wallet provider
  const sendTx = async () => {
    const tx = await walletProvider.request({ method: 'eth_sendTransaction', params: [...] });
  };
}
```

## Best Practices

1. **Always use public providers for read operations**: This reduces load on wallet RPC endpoints and gives you control over infrastructure.

2. **Check provider availability**: Both providers may not be available immediately after page load.

3. **Handle errors gracefully**: Network requests can fail, always wrap RPC calls in try-catch blocks.

4. **Cache read results when appropriate**: Public providers allow aggressive caching strategies since you control the infrastructure.

5. **Use proper TypeScript types**: Import provider types for better type safety:
   ```typescript
   import type { PublicProvider, WalletProvider } from '@walletmesh/modal-react';
   ```

## Common Use Cases

### Token Balances
```tsx
const { provider } = usePublicProvider();
const balance = await provider.request({
  method: 'eth_call',
  params: [{
    to: tokenAddress,
    data: balanceOfCalldata
  }, 'latest']
});
```

### NFT Metadata
```tsx
const { provider } = usePublicProvider();
const tokenURI = await provider.request({
  method: 'eth_call',
  params: [{
    to: nftContract,
    data: tokenURICalldata
  }, 'latest']
});
```

### Gas Estimation
```tsx
const { provider } = usePublicProvider();
const gasEstimate = await provider.request({
  method: 'eth_estimateGas',
  params: [transaction]
});
```

### Transaction Monitoring
```tsx
const { provider } = usePublicProvider();
const receipt = await provider.request({
  method: 'eth_getTransactionReceipt',
  params: [txHash]
});
```

## Troubleshooting

### Provider is null
- Ensure WalletMeshProvider is properly configured with chain information
- For public provider: Either provide dappRpcUrls OR have a wallet connected (for fallback)
- For wallet provider: Verify that a wallet is connected

### RPC errors
- Check your dApp RPC endpoints are accessible
- Ensure proper CORS headers on your RPC endpoints
- Verify rate limits are not being exceeded

### Type errors
- Import types from `@walletmesh/modal-react` not `@walletmesh/modal-core`
- Use generic type parameter for wallet provider if needed: `useWalletProvider<CustomProvider>()`