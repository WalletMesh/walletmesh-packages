[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecBatch

# Function: useAztecBatch()

> **useAztecBatch**(): [`UseAztecBatchReturn`](../interfaces/UseAztecBatchReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:257](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecBatch.ts#L257)

Hook for executing multiple Aztec transactions in batch

This hook provides functionality for executing multiple contract
interactions together, with individual progress tracking and error
handling for each transaction. Transactions are executed sequentially
but tracked as a batch.

## Returns

[`UseAztecBatchReturn`](../interfaces/UseAztecBatchReturn.md)

Batch transaction functions and state

## Since

1.0.0

## Remarks

The hook provides two execution modes:

**Sequential Mode (default)**:
- Transactions execute one-by-one
- Each transaction gets its own proof
- Individual transactions can fail independently
- Detailed progress tracking for each transaction

**Atomic Mode** (via `{ atomic: true }` option):
- All transactions execute as a single atomic batch
- Single proof for all operations (more efficient)
- All operations succeed together or all fail together
- Uses Aztec's native BatchCall functionality

Features:
- Batch transaction execution
- Individual/unified transaction status tracking
- Progress calculation
- Error handling
- Success/failure counting

## Examples

```tsx
import { useAztecBatch, useAztecContract } from '@walletmesh/modal-react';

function BatchTransfer({ tokenAddress, TokenArtifact }) {
  const { executeBatch, transactionStatuses, progress } = useAztecBatch();
  const { contract: tokenContract } = useAztecContract(tokenAddress, TokenArtifact);

  const handleBatchTransfer = async () => {
    if (!tokenContract) return;

    const interactions = [
      tokenContract.methods.transfer(address1, amount1),
      tokenContract.methods.transfer(address2, amount2),
      tokenContract.methods.transfer(address3, amount3),
    ];

    try {
      const receipts = await executeBatch(interactions);
      console.log('All transfers completed:', receipts);
    } catch (error) {
      console.error('Some transfers failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleBatchTransfer} disabled={!tokenContract}>
        Send Batch Transfers
      </button>

      {transactionStatuses.length > 0 && (
        <div>
          <progress value={progress} max={100} />
          <p>{progress}% complete</p>

          {transactionStatuses.map((status) => (
            <div key={status.index}>
              Transaction {status.index + 1}: {status.status}
              {status.error && <span> - {status.error.message}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

```tsx
// Atomic batch execution (all succeed or all fail together)
function AtomicBatchTransfer({ tokenAddress, TokenArtifact }) {
  const { executeBatch, progress, error } = useAztecBatch();
  const { contract: tokenContract } = useAztecContract(tokenAddress, TokenArtifact);

  const handleAtomicBatch = async () => {
    if (!tokenContract) return;

    const interactions = [
      tokenContract.methods.transfer(address1, amount1),
      tokenContract.methods.transfer(address2, amount2),
      tokenContract.methods.transfer(address3, amount3),
    ];

    try {
      // Execute as atomic batch - single transaction with one proof
      const receipts = await executeBatch(interactions, { atomic: true });
      console.log('All transfers completed atomically:', receipts);
    } catch (error) {
      console.error('Entire batch failed:', error);
      // If any operation fails, ALL operations are reverted
    }
  };

  return (
    <div>
      <button onClick={handleAtomicBatch} disabled={!tokenContract}>
        Send Atomic Batch (All or Nothing)
      </button>
      {error && <p>Batch failed: {error.message}</p>}
    </div>
  );
}
```

```tsx
// Complex batch with different contract interactions
function ComplexBatch() {
  const { executeBatch, completedTransactions, failedTransactions } = useAztecBatch();

  const { contract: token1 } = useAztecContract(token1Address, TokenArtifact);
  const { contract: token2 } = useAztecContract(token2Address, TokenArtifact);
  const { contract: dex } = useAztecContract(dexAddress, DexArtifact);

  const handleComplexBatch = async () => {
    if (!token1 || !token2 || !dex) return;

    const interactions = [
      // Approve tokens for DEX
      token1.methods.approve(dexAddress, amount1),
      token2.methods.approve(dexAddress, amount2),
      // Add liquidity
      dex.methods.addLiquidity(token1Address, token2Address, amount1, amount2),
      // Stake LP tokens
      dex.methods.stakeLPTokens(lpAmount),
    ];

    const receipts = await executeBatch(interactions);

    console.log(`Completed: ${completedTransactions}, Failed: ${failedTransactions}`);
  };

  return (
    <button onClick={handleComplexBatch}>
      Execute Complex Batch
    </button>
  );
}
```
