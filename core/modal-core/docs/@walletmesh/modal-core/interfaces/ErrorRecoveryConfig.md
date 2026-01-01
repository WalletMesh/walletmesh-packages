[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ErrorRecoveryConfig

# Interface: ErrorRecoveryConfig

Recovery configuration options

## Properties

### categorizeError()?

> `optional` **categorizeError**: (`error`) => [`IconErrorType`](../type-aliases/IconErrorType.md)

Custom error categorization function

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

[`IconErrorType`](../type-aliases/IconErrorType.md)

***

### customClassifier()?

> `optional` **customClassifier**: (`error`, `iconUri`, `context?`) => [`IconError`](IconError.md)

Custom error classifier function

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

##### iconUri

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

[`IconError`](IconError.md)

***

### customStrategySelector()?

> `optional` **customStrategySelector**: (`error`) => [`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)

Custom strategy selector function

#### Parameters

##### error

[`IconError`](IconError.md)

#### Returns

[`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)

***

### enableLogging?

> `optional` **enableLogging**: `boolean`

Whether to log recovery attempts

***

### maxRetries?

> `optional` **maxRetries**: `number`

Maximum number of retry attempts

***

### onRecoveryAttempt()?

> `optional` **onRecoveryAttempt**: (`error`, `strategy`) => `void`

Callback when recovery is attempted

#### Parameters

##### error

[`IconError`](IconError.md)

##### strategy

[`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)

#### Returns

`void`

***

### onRecoveryFailure()?

> `optional` **onRecoveryFailure**: (`error`) => `void`

Callback when all recovery strategies fail

#### Parameters

##### error

[`IconError`](IconError.md)

#### Returns

`void`

***

### onRecoverySuccess()?

> `optional` **onRecoverySuccess**: (`result`) => `void`

Callback when recovery succeeds

#### Parameters

##### result

[`RecoveryResult`](RecoveryResult.md)

#### Returns

`void`

***

### retryDelay?

> `optional` **retryDelay**: `number`

Delay between retry attempts (ms)

***

### strategies

> **strategies**: [`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)[]

Ordered list of recovery strategies to try
