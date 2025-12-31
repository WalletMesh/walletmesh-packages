[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchingEventData

# Interface: ChainSwitchingEventData

Event data emitted when chain switching starts

## Example

```ts
const eventData: ChainSwitchingEventData = {
  chainId: '1',
  targetChainId: '137',
  walletId: 'metamask'
};
```

## Properties

### chainId

> **chainId**: `string`

***

### targetChainId

> **targetChainId**: `string`

***

### walletId

> **walletId**: `string`
