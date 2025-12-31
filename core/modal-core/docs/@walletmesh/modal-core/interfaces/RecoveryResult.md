[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / RecoveryResult

# Interface: RecoveryResult

Recovery action result

## Properties

### error?

> `optional` **error**: `Error` \| \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

Error information when recovery fails

***

### fallbackData?

> `optional` **fallbackData**: `null` \| \{ `alt`: `string`; `src?`: `string`; `text?`: `string`; `type`: `"icon"` \| `"text"`; \}

Fallback data for UI rendering

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Additional recovery metadata

***

### result?

> `optional` **result**: `Error` \| `HTMLIFrameElement` \| [`FallbackIconConfig`](FallbackIconConfig.md)

Result of recovery (iframe, config, or error)

***

### retryData?

> `optional` **retryData**: `object`

Retry information for retry strategies

#### attempt

> **attempt**: `number`

#### delay

> **delay**: `number`

#### maxRetries

> **maxRetries**: `number`

***

### strategy

> **strategy**: [`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)

Recovery strategy that was used

***

### success

> **success**: `boolean`

Whether recovery was successful
