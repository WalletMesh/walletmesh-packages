[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransactionStatus

# Type Alias: TransactionStatus

> **TransactionStatus** = `"idle"` \| `"initiated"` \| `"simulating"` \| `"proving"` \| `"sending"` \| `"pending"` \| `"confirming"` \| `"confirmed"` \| `"failed"`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:42

Transaction status tracking throughout the lifecycle of a blockchain transaction.

Uses Aztec-native terminology aligned with the official Aztec.js SDK:
- `initiated` - transaction has been received and ID generated (backend-only)
- `simulating` maps to Aztec's simulate() method
- `proving` is unique to zero-knowledge systems
- `sending` maps to Aztec's send() method
- `pending` is standard for awaiting confirmation

## Remarks

The transaction lifecycle follows this progression:
1. `idle` - Initial state before any action
2. `initiated` - Transaction received by backend, ID generated (Aztec only)
3. `simulating` - Transaction is being simulated (maps to Aztec's simulate())
4. `proving` - Zero-knowledge proof is being generated (Aztec only)
5. `sending` - Transaction is being sent to the network (maps to Aztec's send())
6. `pending` - Transaction submitted, awaiting network inclusion
7. `confirming` - Transaction included, awaiting confirmations
8. `confirmed` - Transaction has been confirmed on-chain
9. `failed` - Transaction failed at any stage

Note: The `initiated` and `proving` steps only occur for privacy-preserving
chains like Aztec where zero-knowledge proofs must be generated before submission.

## Example

```typescript
// Monitor transaction status changes
if (transaction.status === 'proving') {
  console.log('Generating zero-knowledge proof... This may take 30-60 seconds');
} else if (transaction.status === 'simulating') {
  console.log('Simulating transaction execution...');
} else if (transaction.status === 'sending') {
  console.log('Sending transaction to network...');
} else if (transaction.status === 'confirmed') {
  console.log('Transaction successful!');
}
```
