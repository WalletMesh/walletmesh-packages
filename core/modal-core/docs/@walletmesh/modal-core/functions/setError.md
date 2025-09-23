[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / setError

# Function: setError()

> **setError**(`state`, `context`, `error`): `void`

## Parameters

### state

`Draft`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

### context

`string`

### error

#### category

`"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

#### cause?

`unknown` = `...`

Underlying cause of the error

#### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"` = `...`

Error classification for recovery purposes

#### code

`string` = `...`

Error code identifier

#### data?

`Record`\<`string`, `unknown`\> = `...`

Additional error data

#### maxRetries?

`number` = `...`

Maximum number of retry attempts

#### message

`string` = `...`

Human-readable error message

#### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"` = `...`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

#### retryDelay?

`number` = `...`

Retry delay in milliseconds (for retry strategies)

## Returns

`void`
