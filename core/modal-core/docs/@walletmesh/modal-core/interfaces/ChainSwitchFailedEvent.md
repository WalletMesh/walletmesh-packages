[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchFailedEvent

# Interface: ChainSwitchFailedEvent

Chain switch failed

## Properties

### error

> **error**: `object`

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

### sessionId

> **sessionId**: `string`

***

### targetChain

> **targetChain**: `object`

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### name

> **name**: `string`

Human-readable name of the chain

#### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

***

### targetChainType

> **targetChainType**: [`ChainType`](../enumerations/ChainType.md)

***

### timestamp

> **timestamp**: `number`

***

### walletId

> **walletId**: `string`
