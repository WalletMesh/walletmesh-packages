[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ErrorAnalysis

# Interface: ErrorAnalysis

Error analysis

## Properties

### classification

> **classification**: [`ErrorClassification`](../type-aliases/ErrorClassification.md)

Error classification

***

### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

Additional context

***

### maxRetries?

> `optional` **maxRetries**: `number`

Maximum retry attempts

***

### recoverable

> **recoverable**: `boolean`

Whether error is recoverable

***

### retryDelay?

> `optional` **retryDelay**: `number`

Retry delay in milliseconds

***

### suggestedStrategy

> **suggestedStrategy**: [`RecoveryStrategy`](../type-aliases/RecoveryStrategy.md)

Suggested recovery strategy
