[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainEnsuranceConfig

# Interface: ChainEnsuranceConfig

Configuration for chain ensurance behavior

## Example

```ts
const config: ChainEnsuranceConfig = {
  autoSwitch: true,
  requireUserConfirmation: true,
  validationTimeout: 5000,
  retryOnFailure: true,
  throwOnError: false,
  maxSwitchAttempts: 3,
  switchTimeoutMs: 30000
};
```

## Properties

### autoSwitch?

> `optional` **autoSwitch**: `boolean`

Enable automatic chain switching

***

### maxSwitchAttempts?

> `optional` **maxSwitchAttempts**: `number`

Maximum switch attempts

***

### requireUserConfirmation?

> `optional` **requireUserConfirmation**: `boolean`

Show user confirmation before switching

***

### retryOnFailure?

> `optional` **retryOnFailure**: `boolean`

Retry failed validations

***

### switchTimeoutMs?

> `optional` **switchTimeoutMs**: `number`

Switch timeout in milliseconds

***

### throwOnError?

> `optional` **throwOnError**: `boolean`

Throw errors on validation failure

***

### validationTimeout?

> `optional` **validationTimeout**: `number`

Validation timeout in milliseconds
