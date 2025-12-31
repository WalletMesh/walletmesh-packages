[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchCompletedEventData

# Interface: ChainSwitchCompletedEventData

Event data emitted when chain switching completes

## Example

```ts
const eventData: ChainSwitchCompletedEventData = {
  previousChainId: '1',
  newChainId: '137',
  walletId: 'metamask',
  duration: 3500
};
```

## Properties

### duration

> **duration**: `number`

***

### newChainId

> **newChainId**: `string`

***

### previousChainId

> **previousChainId**: `string`

***

### walletId

> **walletId**: `string`
