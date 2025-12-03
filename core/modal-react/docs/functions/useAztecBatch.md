[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecBatch

# Function: useAztecBatch()

> **useAztecBatch**(): [`UseAztecBatchReturn`](../interfaces/UseAztecBatchReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecBatch.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecBatch.ts#L167)

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

The hook provides:
- Batch transaction execution
- Individual transaction status tracking
- Progress calculation
- Error handling per transaction
- Success/failure counting

Transactions are executed sequentially to avoid nonce issues,
but the entire batch is tracked as a single operation.

## Examples

```tsx
import { useAztecBatch, useAztecContract } from '@walletmesh/modal-react';

function BatchTransfer({ tokenContract }) {
  const { executeBatch, transactionStatuses, progress } = useAztecBatch();

  const handleBatchTransfer = async () => {
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
      <button onClick={handleBatchTransfer}>
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
// Complex batch with different contract interactions
function ComplexBatch() {
  const { executeBatch, completedTransactions, failedTransactions } = useAztecBatch();
  const { aztecWallet } = useAztecWallet();

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
