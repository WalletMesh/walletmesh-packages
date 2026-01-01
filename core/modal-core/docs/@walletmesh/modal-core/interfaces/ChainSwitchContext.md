[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchContext

# Interface: ChainSwitchContext

Context for chain switching operations

## Example

```ts
const context: ChainSwitchContext = {
  currentChain: { chainId: '1', chainType: 'evm', name: 'Ethereum' },
  targetChain: { chainId: '137', chainType: 'evm', name: 'Polygon' },
  providers: [evmProvider],
  walletConstraints: { maxGasPrice: '100000000000' }
};
```

## Properties

### currentChain

> **currentChain**: `null` \| [`ServiceChainInfo`](ServiceChainInfo.md)

Current chain state

***

### providers

> **providers**: [`BlockchainProvider`](BlockchainProvider.md)[]

Available providers

***

### targetChain

> **targetChain**: [`ServiceChainInfo`](ServiceChainInfo.md)

Target chain

***

### walletConstraints?

> `optional` **walletConstraints**: `Record`\<`string`, `unknown`\>

Wallet constraints
