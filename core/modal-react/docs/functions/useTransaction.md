[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useTransaction

# Function: useTransaction()

> **useTransaction**(): [`UseTransactionReturn`](../interfaces/UseTransactionReturn.md)

Defined in: [core/modal-react/src/hooks/useTransaction.ts:258](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useTransaction.ts#L258)

Hook for managing cross-chain transactions

Provides a comprehensive interface for sending transactions across multiple blockchain networks
using TanStack Query's useMutation for efficient state management. Features automatic chain
validation, gas estimation, transaction tracking, and error handling.

## Returns

[`UseTransactionReturn`](../interfaces/UseTransactionReturn.md)

Transaction methods and state including send functionality, status tracking, and utilities

## Since

1.0.0

## See

 - [useAccount](useAccount.md) - For wallet connection state and address information
 - [useSwitchChain](useSwitchChain.md) - For switching chains before transactions
 - [useBalance](useBalance.md) - For checking balances before sending transactions
 - [useConnect](useConnect.md) - For establishing wallet connections

## Remarks

## Benefits of TanStack Query Integration

- **Automatic State Management**: Loading, error, and success states handled automatically
- **Optimistic Updates**: Update UI before transaction confirms
- **Error Recovery**: Built-in retry logic with exponential backoff
- **Cache Integration**: Transaction results cached and queryable
- **Mutation Lifecycle**: Access to onMutate, onSuccess, onError callbacks

## Supported Blockchain Types

This hook provides a unified interface for transactions across different blockchain types:

- **EVM Chains**: Ethereum, Polygon, BSC, Arbitrum, etc.
- **Solana**: Solana mainnet and devnet
- **Aztec**: Privacy-preserving transactions

## Transaction Lifecycle

Each transaction goes through the following stages:

1. **Validation** (`preparing`): Parameter validation and chain compatibility checks
2. **Preparation** (`preparing`): Gas estimation, balance checks, and transaction building
3. **Signing** (`signing`): User approval and transaction signing in wallet
4. **Broadcasting** (`broadcasting`): Submission to the blockchain network
5. **Confirmation** (`confirming`): Waiting for network confirmation
6. **Completed** (`confirmed`): Transaction successfully included in a block

## Examples

```tsx
// Basic EVM transaction with TanStack Query
import { useTransaction } from '@walletmesh/modal-react';

function TransferForm() {
  const { sendTransaction, isPending, error, status } = useTransaction();

  const handleTransfer = async () => {
    try {
      const result = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E123',
        value: '1000000000000000000', // 1 ETH in wei
        chain: { chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' } // Ethereum mainnet
      });

      console.log('Transaction hash:', result.hash);

      // Wait for confirmation
      const confirmed = await result.wait();
      console.log('Confirmed in block:', confirmed.blockNumber);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleTransfer} disabled={isPending}>
        {isPending ? `${status}...` : 'Send ETH'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

```tsx
// Using mutation callbacks for UI updates
import { useTransaction, useBalance } from '@walletmesh/modal-react';
import { useState } from 'react';

function TransactionWithCallbacks() {
  const { sendTransactionAsync } = useTransaction();
  const { invalidate } = useBalance();
  const [txHash, setTxHash] = useState<string>();

  const handleSend = async () => {
    try {
      const result = await sendTransactionAsync({
        to: '0x...',
        value: '1000000000000000000'
      });

      // Transaction sent successfully
      setTxHash(result.hash);

      // Invalidate balance to refetch
      await invalidate();

      // Wait for confirmation
      await result.wait();
      console.log('Transaction confirmed!');
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleSend}>Send Transaction</button>
      {txHash && <p>Transaction: {txHash}</p>}
    </div>
  );
}
```

```tsx
// Cross-chain transaction with automatic chain switching
import { useTransaction, useAccount } from '@walletmesh/modal-react';

function CrossChainTransfer() {
  const { sendTransaction, isPending } = useTransaction();
  const { chain: currentChain } = useAccount();

  const handleCrossChainTransfer = async () => {
    try {
      // Send transaction on Polygon (will auto-switch from current chain)
      const result = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E123',
        value: '1000000000000000000',
        chain: { chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' }, // Polygon
        autoSwitchChain: true // Automatically switch chains if needed
      });

      console.log('Cross-chain transaction sent:', result.hash);
    } catch (err) {
      console.error('Cross-chain transaction failed:', err);
    }
  };

  return (
    <div>
      <p>Current chain: {currentChain?.name}</p>
      <button onClick={handleCrossChainTransfer} disabled={isPending}>
        Send to Polygon
      </button>
    </div>
  );
}
```
