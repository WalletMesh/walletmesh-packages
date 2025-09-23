[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / BaseTransactionParams

# Interface: BaseTransactionParams

Base transaction parameters common to all blockchain types.

These parameters provide chain-agnostic configuration options that apply
to all transaction types regardless of the underlying blockchain.

## Example

```typescript
const baseParams: BaseTransactionParams = {
  chainId: '1', // Ethereum mainnet
  autoSwitchChain: true, // Auto-switch if on wrong chain
  metadata: {
    description: 'Purchase NFT',
    action: 'nft-mint',
    data: {
      tokenId: '1234',
      collection: 'CoolNFTs'
    }
  }
};
```

## Extended by

- [`EVMTransactionParams`](../../../../@walletmesh/modal-core/interfaces/EVMTransactionParams.md)
- [`SolanaTransactionParams`](../../../../@walletmesh/modal-core/interfaces/SolanaTransactionParams.md)
- [`AztecTransactionParams`](../../../../@walletmesh/modal-core/interfaces/AztecTransactionParams.md)

## Properties

### autoSwitchChain?

> `optional` **autoSwitchChain**: `boolean`

Whether to automatically switch chains if the wallet is on a different chain.
When true, the service will attempt to switch to the target chainId before sending.
Defaults to false if not specified.

***

### chainId?

> `optional` **chainId**: `string`

Target chain ID for the transaction.
If specified and different from current chain, may trigger chain switch.

***

### metadata?

> `optional` **metadata**: `object`

Transaction metadata for tracking and UI purposes.
This data is stored with the transaction but not sent on-chain.

#### action?

> `optional` **action**: `string`

Categorization tag for the transaction (e.g., 'swap', 'transfer', 'nft-mint')

#### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Custom application-specific data associated with this transaction

#### description?

> `optional` **description**: `string`

Human-readable description of the transaction purpose
