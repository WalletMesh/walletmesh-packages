[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecTransaction

# Function: useAztecTransaction()

> **useAztecTransaction**(): [`UseAztecTransactionReturn`](../interfaces/UseAztecTransactionReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecTransaction.ts:154](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecTransaction.ts#L154)

Hook for managing Aztec transactions

This hook provides a simplified way to execute transactions with
automatic state management, error handling, and progress tracking.

## Returns

[`UseAztecTransactionReturn`](../interfaces/UseAztecTransactionReturn.md)

Transaction management utilities

## Since

1.0.0

## Remarks

The hook automatically handles:
- Loading states for each transaction phase
- Error handling with user-friendly messages
- Proving progress tracking
- Transaction receipt checking
- Success/failure callbacks

## Examples

```tsx
import { useAztecTransaction } from '@walletmesh/modal-react';

function TransactionExample() {
  const { execute, isExecuting, status, error } = useAztecTransaction();

  const handleTransfer = async () => {
    const result = await execute(
      async (wallet) => {
        const contract = await Contract.at(address, artifact, wallet);
        return contract.methods.transfer(recipient, amount);
      },
      {
        onSent: (hash) => console.log('Transaction sent:', hash),
        onSuccess: (receipt) => console.log('Success:', receipt),
        onError: (err) => console.error('Failed:', err),
      }
    );
  };

  return (
    <div>
      <button onClick={handleTransfer} disabled={isExecuting}>
        {isExecuting ? `${status}...` : 'Send Transaction'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

```tsx
// With proving progress tracking
function ContractDeployment() {
  const { execute, provingProgress, status } = useAztecTransaction();

  const handleDeploy = async () => {
    await execute(
      async (wallet) => {
        return wallet.deployContract(ContractArtifact, [param1, param2]);
      },
      {
        onProvingProgress: (progress) => {
          console.log(`Proving: ${progress}%`);
        },
      }
    );
  };

  return (
    <div>
      {status === 'proving' && (
        <progress value={provingProgress} max={100} />
      )}
      <button onClick={handleDeploy}>Deploy Contract</button>
    </div>
  );
}
```
