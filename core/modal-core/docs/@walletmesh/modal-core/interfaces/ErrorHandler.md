[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ErrorHandler

# Interface: ErrorHandler

Centralized error handler service
 ErrorHandler

## Implements

- [`Disposable`](Disposable.md)

## Methods

### dispose()

> **dispose**(): `void`

Clean up error handler resources

#### Returns

`void`

#### Implementation of

`Disposable.dispose`

***

### getUserMessage()

> **getUserMessage**(`error`): `string`

Get user-friendly error message

#### Parameters

##### error

`unknown`

Error to get message from

#### Returns

`string`

User-friendly error message

***

### handleError()

> **handleError**(`error`, `context?`): `object`

Convert any error to standardized ModalError

#### Parameters

##### error

`unknown`

Error to handle

##### context?

Optional error context

###### attempt?

`number` = `...`

Attempt number for retry scenarios

###### chainId?

`string` = `...`

Chain ID if error is chain-related

###### component?

`string` = `...`

Component or module where error occurred

###### extra?

`Record`\<`string`, `unknown`\> = `...`

Additional context data

###### method?

`string` = `...`

Method or function where error occurred

###### operation?

`string` = `...`

Operation that caused the error

###### timestamp?

`Date` = `...`

Timestamp when error occurred

###### userAgent?

`string` = `...`

User agent information

###### walletId?

`string` = `...`

Wallet ID if error is wallet-related

#### Returns

Standardized modal error

##### category

> **category**: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

##### cause?

> `optional` **cause**: `unknown`

Underlying cause of the error

##### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

Error classification for recovery purposes

##### code

> **code**: `string`

Error code identifier

##### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Additional error data

##### maxRetries?

> `optional` **maxRetries**: `number`

Maximum number of retry attempts

##### message

> **message**: `string`

Human-readable error message

##### recoveryStrategy?

> `optional` **recoveryStrategy**: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

##### retryDelay?

> `optional` **retryDelay**: `number`

Retry delay in milliseconds (for retry strategies)

***

### isFatal()

> **isFatal**(`error`): `boolean`

Check if error is fatal (not recoverable)

#### Parameters

##### error

`unknown`

Error to check

#### Returns

`boolean`

True if error is fatal

***

### logError()

> **logError**(`error`, `operation?`): `void`

Log error with appropriate level

#### Parameters

##### error

`unknown`

Error to log

##### operation?

`string`

Operation context for the error

#### Returns

`void`
