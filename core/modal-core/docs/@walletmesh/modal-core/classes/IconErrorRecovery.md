[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / IconErrorRecovery

# Class: IconErrorRecovery

Unified error recovery pipeline for icon loading failures

This class provides a standardized approach to handling icon loading errors
across all framework implementations. It supports multiple recovery strategies
and can be configured for different error scenarios.

## Example

```typescript
const recovery = new IconErrorRecovery({
  strategies: ['fallback-icon', 'text-fallback', 'empty'],
  enableLogging: true
});

try {
  const iframe = await createSandboxedIcon(options);
  return iframe;
} catch (error) {
  const result = await recovery.recover(error, options);
  if (result.success) {
    return result.result;
  }
  throw error;
}
```

## Constructors

### Constructor

> **new IconErrorRecovery**(`config`): `IconErrorRecovery`

#### Parameters

##### config

`Partial`\<[`ErrorRecoveryConfig`](../interfaces/ErrorRecoveryConfig.md)\> = `{}`

#### Returns

`IconErrorRecovery`

## Methods

### getConfig()

> **getConfig**(): `Required`\<[`ErrorRecoveryConfig`](../interfaces/ErrorRecoveryConfig.md)\>

Gets current configuration

#### Returns

`Required`\<[`ErrorRecoveryConfig`](../interfaces/ErrorRecoveryConfig.md)\>

***

### recover()

> **recover**(`errorParam`, `originalOptions`, `recoveryOptions?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RecoveryResult`](../interfaces/RecoveryResult.md)\>

Attempts to recover from an icon loading error

#### Parameters

##### errorParam

The error that occurred

`null` | `Error`

##### originalOptions

Original icon options (can be string for iconDataUri)

`string` | [`CreateSandboxedIconOptions`](../interfaces/CreateSandboxedIconOptions.md)

##### recoveryOptions?

`Partial`\<[`ErrorRecoveryConfig`](../interfaces/ErrorRecoveryConfig.md)\>

Additional recovery options

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`RecoveryResult`](../interfaces/RecoveryResult.md)\>

Recovery result with success status and result

***

### resetRetryCounters()

> **resetRetryCounters**(): `void`

Resets retry counters (useful for testing)

#### Returns

`void`
