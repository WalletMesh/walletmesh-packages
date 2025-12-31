[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ensureModalError

# Function: ensureModalError()

> **ensureModalError**(`value`, `context?`): `object`

**`Function`**

Convert unknown values to ModalError with stack traces preserved

This utility ensures that errors have proper ModalError structure with all
the rich metadata used by modal-core for error handling, recovery, and UI display.

 ensureModalError

## Parameters

### value

`unknown`

Unknown value that might be an error

### context?

Optional context for the error

#### attempt?

`number` = `...`

Attempt number for retry scenarios

#### chainId?

`string` = `...`

Chain ID if error is chain-related

#### component?

`string` = `...`

Component or module where error occurred

#### extra?

`Record`\<`string`, `unknown`\> = `...`

Additional context data

#### method?

`string` = `...`

Method or function where error occurred

#### operation?

`string` = `...`

Operation that caused the error

#### timestamp?

`Date` = `...`

Timestamp when error occurred

#### userAgent?

`string` = `...`

User agent information

#### walletId?

`string` = `...`

Wallet ID if error is wallet-related

## Returns

ModalError instance with preserved stack trace

### category

> **category**: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

### cause?

> `optional` **cause**: `unknown`

Underlying cause of the error

### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

Error classification for recovery purposes

### code

> **code**: `string`

Error code identifier

### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Additional error data

### maxRetries?

> `optional` **maxRetries**: `number`

Maximum number of retry attempts

### message

> **message**: `string`

Human-readable error message

### recoveryStrategy?

> `optional` **recoveryStrategy**: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

### retryDelay?

> `optional` **retryDelay**: `number`

Retry delay in milliseconds (for retry strategies)

## Example

```typescript
try {
  await wallet.connect();
} catch (error) {  // error is 'unknown'
  const modalError = ensureModalError(error, {
    component: 'WalletConnector',
    operation: 'connect',
    walletId: 'metamask'
  });
  throw modalError;
}
```
