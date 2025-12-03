[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransportErrorEvent

# Interface: TransportErrorEvent

Defined in: core/modal-core/dist/types.d.ts:815

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

Defined in: core/modal-core/dist/types.d.ts:826

Modal error object with rich error information
Contains error code, message, and optional metadata
Common error codes:
- TRANSPORT_TIMEOUT: Connection or request timed out
- TRANSPORT_CLOSED: Transport is closed
- TRANSPORT_ERROR: Generic transport error

#### category

> **category**: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`

#### cause?

> `optional` **cause**: `unknown`

#### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

#### code

> **code**: `string`

#### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

#### maxRetries?

> `optional` **maxRetries**: `number`

#### message

> **message**: `string`

#### recoveryStrategy?

> `optional` **recoveryStrategy**: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`

#### retryDelay?

> `optional` **retryDelay**: `number`

***

### type

> **type**: `"error"`

Defined in: core/modal-core/dist/types.d.ts:817

Event type identifier - always 'error' for error events
