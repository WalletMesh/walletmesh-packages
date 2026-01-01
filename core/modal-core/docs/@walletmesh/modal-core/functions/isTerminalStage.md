[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isTerminalStage

# Function: isTerminalStage()

> **isTerminalStage**(`stage`): `boolean`

Check if a stage is terminal

Terminal stages are 'connected' or 'failed'.

## Parameters

### stage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Connection stage to check

## Returns

`boolean`

True if stage is terminal

## Example

```typescript
console.log(isTerminalStage('connecting')); // false
console.log(isTerminalStage('connected')); // true
console.log(isTerminalStage('failed')); // true
```
