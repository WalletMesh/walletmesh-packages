[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchSuccessData

# Interface: ChainSwitchSuccessData

Data provided to chain switch success callback

## Example

```ts
const data: ChainSwitchSuccessData = {
  previousChain: { chainId: '1', chainType: 'evm', name: 'Ethereum' },
  newChain: { chainId: '137', chainType: 'evm', name: 'Polygon' },
  wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
  duration: 3500
};
```

## Properties

### duration

> **duration**: `number`

Switch duration

***

### newChain

> **newChain**: [`ServiceChainInfo`](ServiceChainInfo.md)

New chain

***

### previousChain

> **previousChain**: `null` \| [`ServiceChainInfo`](ServiceChainInfo.md)

Previous chain

***

### wallet

> **wallet**: [`WalletInfo`](WalletInfo.md)

Wallet that was switched
