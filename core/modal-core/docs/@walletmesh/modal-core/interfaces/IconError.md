[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / IconError

# Interface: IconError

Icon error information

## Properties

### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

Additional context data

***

### iconUri

> **iconUri**: `string`

Icon URI that failed

***

### message

> **message**: `string`

Original error message

***

### originalError?

> `optional` **originalError**: `Error` \| \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

Original error object if available

***

### type

> **type**: [`IconErrorType`](../type-aliases/IconErrorType.md)

Type of error that occurred
