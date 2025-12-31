[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransportErrorEvent

# Interface: TransportErrorEvent

Interface for transport error event

## Remarks

Event emitted when an error occurs in the transport.
Errors can occur during connection, message sending, or due to protocol violations.

 TransportErrorEvent

## Example

```typescript
transport.on('error', (event: TransportErrorEvent) => {
  console.error('Transport error:', event.error.message);
  if (event.error.code === 'TRANSPORT_TIMEOUT') {
    // Handle timeout specifically
  }
});
```

## Properties

### error

> **error**: `object`

Modal error object with rich error information
Contains error code, message, and optional metadata
Common error codes:
- TRANSPORT_TIMEOUT: Connection or request timed out
- TRANSPORT_CLOSED: Transport is closed
- TRANSPORT_ERROR: Generic transport error

#### category

> **category**: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

#### cause?

> `optional` **cause**: `unknown`

Underlying cause of the error

#### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

Error classification for recovery purposes

#### code

> **code**: `string`

Error code identifier

#### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Additional error data

#### maxRetries?

> `optional` **maxRetries**: `number`

Maximum number of retry attempts

#### message

> **message**: `string`

Human-readable error message

#### recoveryStrategy?

> `optional` **recoveryStrategy**: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

#### retryDelay?

> `optional` **retryDelay**: `number`

Retry delay in milliseconds (for retry strategies)

***

### type

> **type**: `"error"`

Event type identifier - always 'error' for error events
