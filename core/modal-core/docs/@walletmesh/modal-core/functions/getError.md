[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getError

# Function: getError()

> **getError**(`state`, `context`): `undefined` \| \{ `category`: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`; `retryDelay?`: `number`; \}

Get error by context

## Parameters

### state

[`WalletMeshState`](../interfaces/WalletMeshState.md)

### context

`string`

## Returns

`undefined`

\{ `category`: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`; `retryDelay?`: `number`; \}

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
