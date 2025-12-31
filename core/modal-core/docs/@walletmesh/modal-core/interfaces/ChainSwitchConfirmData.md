[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchConfirmData

# Interface: ChainSwitchConfirmData

Data provided to chain switch confirmation callback

## Example

```ts
const data: ChainSwitchConfirmData = {
  currentChain: { chainId: '1', chainType: 'evm', name: 'Ethereum' },
  targetChain: { chainId: '137', chainType: 'evm', name: 'Polygon' },
  wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
  estimatedTime: 5000
};
```

## Properties

### currentChain

> **currentChain**: `null` \| [`ServiceChainInfo`](ServiceChainInfo.md)

Current chain

***

### estimatedTime?

> `optional` **estimatedTime**: `number`

Estimated switch time

***

### targetChain

> **targetChain**: [`ServiceChainInfo`](ServiceChainInfo.md)

Target chain

***

### wallet

> **wallet**: [`WalletInfo`](WalletInfo.md)

Wallet being switched
