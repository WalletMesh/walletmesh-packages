[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectionDisplayData

# Interface: ConnectionDisplayData

Defined in: core/modal-core/dist/api/core/headless.d.ts:36

Semantic connection state information

## Properties

### accounts?

> `optional` **accounts**: `string`[]

Defined in: core/modal-core/dist/api/core/headless.d.ts:50

***

### address?

> `optional` **address**: `string`

Defined in: core/modal-core/dist/api/core/headless.d.ts:48

***

### chain?

> `optional` **chain**: `object`

Defined in: core/modal-core/dist/api/core/headless.d.ts:49

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

***

### error?

> `optional` **error**: `object`

Defined in: core/modal-core/dist/api/core/headless.d.ts:42

#### action?

> `optional` **action**: `"retry"` \| `"close"` \| `"select-different"`

#### code

> **code**: `string`

#### message

> **message**: `string`

#### recoverable

> **recoverable**: `boolean`

***

### progress?

> `optional` **progress**: `object`

Defined in: core/modal-core/dist/api/core/headless.d.ts:38

#### message

> **message**: `string`

#### percentage?

> `optional` **percentage**: `number`

***

### state

> **state**: `"connecting"` \| `"connected"` \| `"error"` \| `"idle"` \| `"selecting"`

Defined in: core/modal-core/dist/api/core/headless.d.ts:37
