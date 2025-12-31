[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionDisplayData

# Interface: ConnectionDisplayData

Semantic connection state information

## Properties

### accounts?

> `optional` **accounts**: `string`[]

***

### address?

> `optional` **address**: `string`

***

### chain?

> `optional` **chain**: `object`

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

### error?

> `optional` **error**: `object`

#### action?

> `optional` **action**: `"retry"` \| `"select-different"` \| `"close"`

#### code

> **code**: `string`

#### message

> **message**: `string`

#### recoverable

> **recoverable**: `boolean`

***

### progress?

> `optional` **progress**: `object`

#### message

> **message**: `string`

#### percentage?

> `optional` **percentage**: `number`

***

### state

> **state**: `"connecting"` \| `"connected"` \| `"error"` \| `"idle"` \| `"selecting"`
