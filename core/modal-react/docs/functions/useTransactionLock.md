[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useTransactionLock

# Function: useTransactionLock()

> **useTransactionLock**(): [`UseTransactionLockReturn`](../interfaces/UseTransactionLockReturn.md)

Defined in: [core/modal-react/src/hooks/useTransactionLock.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useTransactionLock.ts#L85)

Hook for managing a transaction execution lock.

This hook provides a synchronous lock mechanism to prevent concurrent
transaction executions at the dApp level. It works as a defense-in-depth
measure alongside the wallet's router-level approval queue.

Key features:
- Synchronous lock check via ref (prevents race conditions from rapid clicks)
- State tracking for UI updates (isLocked)
- Automatic lock management with withLock()

## Returns

[`UseTransactionLockReturn`](../interfaces/UseTransactionLockReturn.md)

Lock management utilities

## Example

```tsx
function TransactionButton() {
  const { isLocked, withLock } = useTransactionLock();
  const { executeSync } = useAztecTransaction();

  const handleTransaction = async () => {
    try {
      await withLock(async () => {
        await executeSync(interaction);
      });
    } catch (error) {
      if (error.message.includes('already in progress')) {
        console.log('Transaction already running');
      }
    }
  };

  return (
    <button onClick={handleTransaction} disabled={isLocked}>
      {isLocked ? 'Processing...' : 'Send Transaction'}
    </button>
  );
}
```
