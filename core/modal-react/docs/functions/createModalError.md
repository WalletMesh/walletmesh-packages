[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createModalError

# Function: createModalError()

> **createModalError**(`code`, `message`, `category?`, `isRecoverable?`, `data?`): `object`

Defined in: core/modal-core/dist/internal/utils/errorManager.d.ts:81

Create a standardized ModalError

## Parameters

### code

`string`

Error code

### message

`string`

Error message

### category?

[`ErrorCategory`](../type-aliases/ErrorCategory.md)

Error category

### isRecoverable?

`boolean`

### data?

`Record`\<`string`, `unknown`\>

Additional error data

## Returns

`object`

ModalError object

### category

> **category**: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`

### cause?

> `optional` **cause**: `unknown`

### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

### code

> **code**: `string`

### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

### maxRetries?

> `optional` **maxRetries**: `number`

### message

> **message**: `string`

### recoveryStrategy?

> `optional` **recoveryStrategy**: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`

### retryDelay?

> `optional` **retryDelay**: `number`
