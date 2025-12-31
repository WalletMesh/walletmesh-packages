[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecTransaction

# Function: useAztecTransaction()

> **useAztecTransaction**(): [`UseAztecTransactionReturn`](../interfaces/UseAztecTransactionReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecTransaction.ts#L206)

Hook for managing Aztec transactions with Wagmi pattern

Provides two execution modes:
- `executeSync()`: Blocking execution with UI overlay (like wagmi's writeContract)
- `execute()`: Background execution with callbacks (like wagmi's writeContractAsync)

## Returns

[`UseAztecTransactionReturn`](../interfaces/UseAztecTransactionReturn.md)

Transaction management utilities

## Since

3.0.0

## Remarks

This hook provides full transaction lifecycle tracking:
1. Preparing/Simulation
2. Proving (30-60 seconds for Aztec)
3. Signing
4. Broadcasting
5. Confirming
6. Confirmed/Failed

Each stage is tracked with timing information for performance monitoring.

## Examples

```tsx
// Sync mode (blocking with overlay)
import { useAztecTransaction, useAztecContract } from '@walletmesh/modal-react';

function MintToken() {
  const { executeSync, isLoading, status } = useAztecTransaction();
  const { contract } = useAztecContract(tokenAddress, TokenArtifact);

  const handleMint = async () => {
    if (!contract) return;

    try {
      // Blocks until complete, shows overlay with progress
      const receipt = await executeSync(
        contract.methods.mint(recipient, amount)
      );
      console.log('Minted!', receipt);
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  return (
    <button onClick={handleMint} disabled={isLoading}>
      {isLoading ? `${status}...` : 'Mint Tokens'}
    </button>
  );
}
```

```tsx
// Async mode (background execution)
import { useAztecTransaction, useAztecContract } from '@walletmesh/modal-react';

function TransferToken() {
  const { execute, backgroundCount } = useAztecTransaction();
  const { contract } = useAztecContract(tokenAddress, TokenArtifact);

  const handleTransfer = async () => {
    if (!contract) return;

    try {
      // Returns immediately with txId, executes in background
      const txId = await execute(
        contract.methods.transfer(recipient, amount),
        {
          onSuccess: (tx) => console.log('Transfer complete!', tx),
          onError: (error) => console.error('Transfer failed:', error),
        }
      );
      console.log('Transaction started:', txId);
      // User can continue working while proving happens
    } catch (error) {
      console.error('Failed to start transaction:', error);
    }
  };

  return (
    <div>
      <button onClick={handleTransfer}>
        Transfer Tokens
      </button>
      {backgroundCount > 0 && (
        <p>{backgroundCount} background transaction(s) in progress</p>
      )}
    </div>
  );
}
```

```tsx
// Monitoring transaction state
function TransactionMonitor() {
  const {
    activeTransaction,
    backgroundTransactions,
    getTransaction,
    status
  } = useAztecTransaction();

  return (
    <div>
      {activeTransaction && (
        <div>
          <h3>Active Transaction</h3>
          <p>Status: {activeTransaction.status}</p>
          <p>Started: {new Date(activeTransaction.startTime).toLocaleTimeString()}</p>
          {activeTransaction.stages.proving && (
            <p>
              Proving: {
                activeTransaction.stages.proving.end
                  ? `${activeTransaction.stages.proving.end - activeTransaction.stages.proving.start}ms`
                  : 'in progress...'
              }
            </p>
          )}
        </div>
      )}

      <h3>Background Transactions ({backgroundTransactions.length})</h3>
      {backgroundTransactions.map(tx => (
        <div key={tx.id}>
          <p>{tx.id}: {tx.status}</p>
        </div>
      ))}
    </div>
  );
}
```
