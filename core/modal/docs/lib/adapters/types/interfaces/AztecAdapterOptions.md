[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / AztecAdapterOptions

# Interface: AztecAdapterOptions

Defined in: [core/modal/src/lib/adapters/types.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L215)

Configuration options specific to Aztec protocol adapters
 AztecAdapterOptions

## Example

```typescript
const options: AztecAdapterOptions = {
  chainId: "aztec:testnet",
  rpcUrl: "https://api.aztec.network/testnet",
  networkId: "11155111"
};
```

## Extends

- [`BaseAdapterOptions`](BaseAdapterOptions.md)

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### chainId?

> `optional` **chainId**: `string`

Defined in: [core/modal/src/lib/adapters/types.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L169)

Chain ID for the adapter

#### Inherited from

[`BaseAdapterOptions`](BaseAdapterOptions.md).[`chainId`](BaseAdapterOptions.md#chainid)

***

### rpcUrl?

> `optional` **rpcUrl**: `string`

Defined in: [core/modal/src/lib/adapters/types.ts:216](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L216)

Aztec network RPC endpoint URL

***

### networkId?

> `optional` **networkId**: `string`

Defined in: [core/modal/src/lib/adapters/types.ts:217](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L217)

Aztec network identifier
