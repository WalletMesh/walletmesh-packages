[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getStageProgress

# Function: getStageProgress()

> **getStageProgress**(`stage`): `number`

Get progress percentage for a stage

## Parameters

### stage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Connection stage

## Returns

`number`

Progress percentage (0-100)

## Example

```typescript
const progress = getStageProgress('connecting');
console.log(progress); // 40
```
