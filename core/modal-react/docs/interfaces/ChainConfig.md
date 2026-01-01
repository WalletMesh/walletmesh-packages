[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainConfig

# Interface: ChainConfig

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:505

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

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:511

Whether to allow dynamic chain addition

***

### chains?

> `optional` **chains**: `ChainInfo`[]

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:507

Chains to support

***

### customChains?

> `optional` **customChains**: `Map`\<`string`, `ChainInfo`\>

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:509

Custom chain configurations

***

### enableValidation?

> `optional` **enableValidation**: `boolean`

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:513

Enable chain switching validation

***

### ensurance?

> `optional` **ensurance**: `ChainEnsuranceConfig`

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:515

Chain ensurance configuration

***

### switchTimeout?

> `optional` **switchTimeout**: `number`

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:519

Default switch timeout

***

### validationTimeout?

> `optional` **validationTimeout**: `number`

Defined in: core/modal-core/dist/services/chain/ChainService.d.ts:517

Default validation timeout
