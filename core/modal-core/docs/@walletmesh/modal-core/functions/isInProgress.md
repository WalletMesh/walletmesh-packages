[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isInProgress

# Function: isInProgress()

> **isInProgress**(`stage`): `boolean`

Check if a stage is in progress

In-progress stages are all non-terminal stages.

## Parameters

### stage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Connection stage to check

## Returns

`boolean`

True if stage is in progress

## Example

```typescript
console.log(isInProgress('initializing')); // true
console.log(isInProgress('connecting')); // true
console.log(isInProgress('connected')); // false
```
