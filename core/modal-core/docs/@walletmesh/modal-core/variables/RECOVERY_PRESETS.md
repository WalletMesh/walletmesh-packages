[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / RECOVERY\_PRESETS

# Variable: RECOVERY\_PRESETS

> `const` **RECOVERY\_PRESETS**: `object`

Predefined recovery configurations for common scenarios

## Type Declaration

### aggressive

> `readonly` **aggressive**: `object`

Aggressive: Try everything including retries

#### aggressive.enableLogging

> `readonly` **enableLogging**: `true` = `true`

#### aggressive.maxRetries

> `readonly` **maxRetries**: `2` = `2`

#### aggressive.retryDelay

> `readonly` **retryDelay**: `500` = `500`

#### aggressive.strategies

> `readonly` **strategies**: [`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)[]

### conservative

> `readonly` **conservative**: `object`

Conservative: Only try fallback icon, then text fallback

#### conservative.enableLogging

> `readonly` **enableLogging**: `false` = `false`

#### conservative.maxRetries

> `readonly` **maxRetries**: `0` = `0`

#### conservative.strategies

> `readonly` **strategies**: [`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)[]

### development

> `readonly` **development**: `object`

Development: Verbose logging, fail fast

#### development.enableLogging

> `readonly` **enableLogging**: `true` = `true`

#### development.maxRetries

> `readonly` **maxRetries**: `0` = `0`

#### development.strategies

> `readonly` **strategies**: [`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)[]

### silent

> `readonly` **silent**: `object`

Silent: No logging, graceful degradation

#### silent.enableLogging

> `readonly` **enableLogging**: `false` = `false`

#### silent.maxRetries

> `readonly` **maxRetries**: `0` = `0`

#### silent.strategies

> `readonly` **strategies**: [`IconRecoveryStrategy`](../type-aliases/IconRecoveryStrategy.md)[]
