[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransactionStatus

# Type Alias: TransactionStatus

> **TransactionStatus** = `"idle"` \| `"preparing"` \| `"proving"` \| `"signing"` \| `"broadcasting"` \| `"confirming"` \| `"confirmed"` \| `"failed"`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:32

Transaction status tracking throughout the lifecycle of a blockchain transaction.

## Remarks

The transaction lifecycle follows this progression:
1. `idle` - Initial state before any action
2. `preparing` - Transaction parameters are being prepared
3. `proving` - Zero-knowledge proof is being generated (Aztec only)
4. `signing` - Transaction is being signed by the wallet
5. `broadcasting` - Transaction is being sent to the network
6. `confirming` - Transaction is awaiting blockchain confirmation
7. `confirmed` - Transaction has been confirmed on-chain
8. `failed` - Transaction failed at any stage

Note: The `proving` step only occurs for privacy-preserving chains like Aztec
where zero-knowledge proofs must be generated before submission.

## Example

```typescript
// Monitor transaction status changes
if (transaction.status === 'proving') {
  console.log('Generating zero-knowledge proof... This may take 30-60 seconds');
} else if (transaction.status === 'signing') {
  console.log('Please approve the transaction in your wallet');
} else if (transaction.status === 'confirmed') {
  console.log('Transaction successful!');
}
```
