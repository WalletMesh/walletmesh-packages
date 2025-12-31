[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getStageDescription

# Function: getStageDescription()

> **getStageDescription**(`stage`): `string`

Get step description for a stage

## Parameters

### stage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Connection stage

## Returns

`string`

Step description

## Example

```typescript
const description = getStageDescription('connecting');
console.log(description); // "Connecting to wallet..."
```
