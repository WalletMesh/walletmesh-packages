[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / AztecAdapterOptions

# Interface: AztecAdapterOptions

Defined in: [core/modal/src/lib/adapters/types.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L215)

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

Defined in: [core/modal/src/lib/adapters/types.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L169)

Chain ID for the adapter

#### Inherited from

[`BaseAdapterOptions`](BaseAdapterOptions.md).[`chainId`](BaseAdapterOptions.md#chainid)

***

### rpcUrl?

> `optional` **rpcUrl**: `string`

Defined in: [core/modal/src/lib/adapters/types.ts:216](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L216)

Aztec network RPC endpoint URL

***

### networkId?

> `optional` **networkId**: `string`

Defined in: [core/modal/src/lib/adapters/types.ts:217](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L217)

Aztec network identifier
