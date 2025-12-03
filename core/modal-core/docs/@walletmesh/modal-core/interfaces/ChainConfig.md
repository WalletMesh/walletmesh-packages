[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainConfig

# Interface: ChainConfig

Configuration options for ChainService

## Example

```ts
const config: ChainConfig = {
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum', ... },
    { chainId: '137', chainType: 'evm', name: 'Polygon', ... }
  ],
  customChains: {
    '42161': { chainId: '42161', chainType: 'evm', name: 'Arbitrum', ... }
  },
  allowDynamicChains: true,
  enableValidation: true,
  ensurance: {
    autoSwitch: true,
    requireUserConfirmation: true
  },
  validationTimeout: 5000,
  switchTimeout: 30000
};
```

## Properties

### allowDynamicChains?

> `optional` **allowDynamicChains**: `boolean`

Whether to allow dynamic chain addition

***

### chains?

> `optional` **chains**: [`ServiceChainInfo`](ServiceChainInfo.md)[]

Chains to support

***

### customChains?

> `optional` **customChains**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`ServiceChainInfo`](ServiceChainInfo.md)\>

Custom chain configurations

***

### enableValidation?

> `optional` **enableValidation**: `boolean`

Enable chain switching validation

***

### ensurance?

> `optional` **ensurance**: [`ChainEnsuranceConfig`](ChainEnsuranceConfig.md)

Chain ensurance configuration

***

### switchTimeout?

> `optional` **switchTimeout**: `number`

Default switch timeout

***

### validationTimeout?

> `optional` **validationTimeout**: `number`

Default validation timeout
