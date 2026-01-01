[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainServiceEvents

# Interface: ChainServiceEvents

Events emitted by the ChainService

## Example

```ts
// Listen to chain switching events
chainService.on('chain:switching', (data) => {
  console.log(`Switching from ${data.chainId} to ${data.targetChainId}`);
});

chainService.on('chain:switched', (data) => {
  console.log(`Switched to ${data.newChainId} in ${data.duration}ms`);
});
```

## Properties

### chain:switched

> **chain:switched**: [`ChainSwitchCompletedEventData`](ChainSwitchCompletedEventData.md)

***

### chain:switching

> **chain:switching**: [`ChainSwitchingEventData`](ChainSwitchingEventData.md)

***

### chain:validation

> **chain:validation**: [`ChainValidationEventData`](ChainValidationEventData.md)
