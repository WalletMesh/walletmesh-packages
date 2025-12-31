[**@walletmesh/modal-core v0.0.3**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / TransactionError

# Interface: TransactionError

Transaction error with detailed context about failure stage.

Extends the base ModalError with transaction-specific information to help
diagnose where and why a transaction failed.

## Remarks

- The `stage` indicates at which point in the lifecycle the error occurred
- Transaction ID and hash may not be available for early-stage failures
- Error messages should be user-friendly when possible

## Example

```typescript
try {
  const result = await txService.sendTransaction(params);
  await result.wait();
} catch (error) {
  if (isTransactionError(error)) {
    console.error(`Transaction failed at ${error.stage}`);
    console.error(`Error: ${error.message}`);

    if (error.stage === 'signing') {
      console.log('User may have rejected the transaction');
    } else if (error.stage === 'confirmation') {
      console.log('Transaction may have been reverted');
    }
  }
}
```

## Extends

- [`ModalError`](../../../../@walletmesh/modal-core/type-aliases/ModalError.md)

## Properties

### category

> **category**: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

#### Inherited from

`ModalError.category`

***

### cause?

> `optional` **cause**: `unknown`

Underlying cause of the error

#### Inherited from

`ModalError.cause`

***

### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

Error classification for recovery purposes

#### Inherited from

`ModalError.classification`

***

### code

> **code**: `string`

Error code identifier

#### Inherited from

`ModalError.code`

***

### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Additional error data

#### Inherited from

`ModalError.data`

***

### maxRetries?

> `optional` **maxRetries**: `number`

Maximum number of retry attempts

#### Inherited from

`ModalError.maxRetries`

***

### message

> **message**: `string`

Human-readable error message

#### Inherited from

`ModalError.message`

***

### recoveryStrategy?

> `optional` **recoveryStrategy**: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

#### Inherited from

`ModalError.recoveryStrategy`

***

### retryDelay?

> `optional` **retryDelay**: `number`

Retry delay in milliseconds (for retry strategies)

#### Inherited from

`ModalError.retryDelay`

***

### stage

> **stage**: `"validation"` \| `"proving"` \| `"preparation"` \| `"signing"` \| `"broadcasting"` \| `"confirmation"`

Transaction lifecycle stage where the error occurred.
- `validation`: Parameters failed validation before sending
- `preparation`: Error while preparing transaction data
- `proving`: Failed to generate zero-knowledge proof (Aztec)
- `signing`: User rejected or wallet failed to sign
- `broadcasting`: Failed to send to the network
- `confirmation`: Transaction reverted or timed out

***

### transactionHash?

> `optional` **transactionHash**: `string`

Blockchain transaction hash if available.
Only present if transaction was successfully broadcast.

***

### transactionId?

> `optional` **transactionId**: `string`

Internal transaction ID if available.
May be undefined for validation/preparation errors.
