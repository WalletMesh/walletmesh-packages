[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / interpolateProgress

# Function: interpolateProgress()

> **interpolateProgress**(`fromStage`, `toStage`, `factor`): `number`

Calculate progress between two stages

Useful for smooth progress animations between stages.

## Parameters

### fromStage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Starting stage

### toStage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Ending stage

### factor

`number`

Interpolation factor (0-1)

## Returns

`number`

Interpolated progress percentage

## Example

```typescript
// Calculate progress halfway between initializing and connecting
const progress = interpolateProgress('initializing', 'connecting', 0.5);
console.log(progress); // 25 (halfway between 10 and 40)
```
