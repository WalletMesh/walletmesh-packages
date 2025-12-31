[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createProgress

# Function: createProgress()

> **createProgress**(`stage`, `details?`): [`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Create progress information for a given stage

## Parameters

### stage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Current connection stage

### details?

`string`

Optional additional details

## Returns

[`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Connection progress information

## Example

```typescript
const progress = createProgress('connecting', 'Connecting to MetaMask...');
console.log(progress);
// {
//   progress: 40,
//   stage: 'connecting',
//   step: 'Connecting to wallet...',
//   details: 'Connecting to MetaMask...'
// }
```
