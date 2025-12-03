# Aztec Proving Flow Documentation

## Overview

The Aztec proving flow is a critical step in Aztec transactions where zero-knowledge proofs are generated. This process happens in the browser or wallet (in the PXE - Private Execution Environment) and can take 30-60 seconds on typical hardware. WalletMesh provides dedicated UI states and safety mechanisms to handle this lengthy process.

## Transaction Status Flow

For Aztec transactions, the status flow includes an additional 'proving' state:

```
idle → preparing → proving → signing → broadcasting → confirming → confirmed/failed
                      ↑
                 (Aztec only)
```

### Status Definitions

- **preparing**: Transaction parameters are being prepared
- **proving**: Zero-knowledge proof is being generated (Aztec-specific)
- **signing**: Transaction is being signed by the wallet
- **broadcasting**: Transaction is being sent to the network
- **confirming**: Transaction is awaiting blockchain confirmation
- **confirmed/failed**: Final transaction state

## Implementation Details

### 1. Transaction Status Type

The `TransactionStatus` type includes the 'proving' status:

```typescript
export type TransactionStatus =
  | 'idle'
  | 'preparing'
  | 'proving'      // Zero-knowledge proof generation
  | 'signing'
  | 'broadcasting'
  | 'confirming'
  | 'confirmed'
  | 'failed';
```

### 2. Modal View States

The modal UI includes a dedicated 'proving' view:

```typescript
export type ModalView =
  | 'walletSelection'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'switchingChain'
  | 'proving';      // Aztec proof generation view
```

### 3. Proving UI

When the modal is in the 'proving' state, it displays:

- A custom spinner animation (2-second rotation cycle)
- Clear messaging: "Generating Proof"
- Duration expectation: "Creating zero-knowledge proof... This may take 30-60 seconds."
- User guidance: "Please keep this window open and do not refresh the page."

```tsx
// Modal component snippet
if (currentView === 'proving') {
  return (
    <div className={styles['provingContainer']}>
      <div className={styles['provingSpinner']} />
      <h3 className={styles['provingTitle']}>Generating Proof</h3>
      <p className={styles['provingMessage']}>
        Creating zero-knowledge proof... This may take 30-60 seconds.
      </p>
      <p className={styles['provingHint']}>
        Please keep this window open and do not refresh the page.
      </p>
    </div>
  );
}
```

### 4. Disconnect Safety

The disconnect safety mechanism prevents users from disconnecting their wallet while a proof is being generated:

```typescript
const pendingTransactions = storeState.transactions.history.filter(
  (tx) =>
    tx.status === 'preparing' ||
    tx.status === 'proving' ||    // Prevents disconnect during proof generation
    tx.status === 'signing' ||
    tx.status === 'broadcasting' ||
    tx.status === 'confirming'
);

if (pendingTransactions.length > 0) {
  throw ErrorFactory.connectionFailed(
    `Cannot disconnect: ${pendingTransactions.length} pending transaction(s). Use force: true to override.`
  );
}
```

Users can override this safety check by passing `{ force: true }` to the disconnect method.

### 5. Transaction Service Integration

The TransactionService recognizes 'proving' as a loading state:

```typescript
computeLoadingState(status: TransactionStatus): boolean {
  return status === 'preparing' || 
         status === 'proving' ||     // Included in loading states
         status === 'signing' || 
         status === 'broadcasting';
}
```

## Usage Example

Here's how an Aztec wallet implementation would use the proving status:

```typescript
// In Aztec wallet adapter
async sendAztecTransaction(params: AztecTransactionParams) {
  const txId = generateTransactionId();
  
  // Set initial status
  updateTransactionStatus(txId, 'preparing');
  
  // Prepare transaction
  const prepared = await prepareTransaction(params);
  
  // Start proving (this is the lengthy step)
  updateTransactionStatus(txId, 'proving');
  modalController.setView('proving');  // Show proving UI
  
  try {
    const proof = await aztecClient.proveTx(prepared);
    // Proving complete, now sign
    
    updateTransactionStatus(txId, 'signing');
    modalController.setView('signing');
    
    const signed = await aztecClient.signTx(proof);
    
    // Continue with broadcasting...
    updateTransactionStatus(txId, 'broadcasting');
    const txHash = await aztecClient.sendTx(signed);
    
    return txHash;
  } catch (error) {
    updateTransactionStatus(txId, 'failed');
    throw error;
  }
}
```

## Best Practices

1. **Always show proving UI**: For Aztec transactions, always transition to the proving view to set user expectations about the wait time.

2. **Prevent accidental interruption**: The disconnect safety ensures users don't accidentally close their wallet or navigate away during proving.

3. **Clear messaging**: The proving UI clearly communicates:
   - What's happening (generating proof)
   - How long it might take (30-60 seconds)
   - What the user should do (keep window open)

4. **Error handling**: If proving fails, provide clear error messages and recovery options.

## Testing

The implementation includes comprehensive tests:

1. **TransactionService tests**: Verify that 'proving' is recognized as a loading state
2. **Modal UI tests**: Ensure the proving view renders correctly
3. **Disconnect safety tests**: Verify that disconnect is prevented during proving
4. **Integration tests**: Test the full flow with mock Aztec transactions

## Future Enhancements

1. **Progress indication**: Add progress percentage if the Aztec SDK provides it
2. **Time estimation**: Show more accurate time estimates based on transaction complexity
3. **Cancel option**: Allow users to cancel proving if supported by the Aztec SDK
4. **Hardware acceleration**: Detect and use GPU acceleration when available