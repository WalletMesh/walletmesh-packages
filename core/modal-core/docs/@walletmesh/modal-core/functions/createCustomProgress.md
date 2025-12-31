[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createCustomProgress

# Function: createCustomProgress()

> **createCustomProgress**(`progress`, `stage`, `step`, `details?`): [`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Create custom progress with specific percentage

Useful for granular progress tracking within a stage.

## Parameters

### progress

`number`

Progress percentage (0-100)

### stage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Current connection stage

### step

`string`

Step description

### details?

`string`

Optional additional details

## Returns

[`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Connection progress information

## Example

```typescript
// Custom progress between stages
const progress = createCustomProgress(60, 'connecting', 'Waiting for approval...', 'Check your wallet');
console.log(progress);
// {
//   progress: 60,
//   stage: 'connecting',
//   step: 'Waiting for approval...',
//   details: 'Check your wallet'
// }
```
