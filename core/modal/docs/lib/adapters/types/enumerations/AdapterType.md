[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / AdapterType

# Enumeration: AdapterType

Defined in: [core/modal/src/lib/adapters/types.ts:195](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L195)

Enumeration of supported wallet adapter implementations.

Each value represents a specific adapter implementation that
handles different wallet protocols or implementations.

## Example

```typescript
const adapterConfig = {
  type: AdapterType.WalletMeshAztec,
  options: {
    chainId: 'aztec:testnet',
    rpcUrl: 'https://testnet.aztec.network'
  }
};
```

## Enumeration Members

### WalletMeshAztec

> **WalletMeshAztec**: `"wm_aztec"`

Defined in: [core/modal/src/lib/adapters/types.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L196)

WalletMesh adapter for Aztec protocol

***

### ObsidionAztec

> **ObsidionAztec**: `"obsidion_aztec"`

Defined in: [core/modal/src/lib/adapters/types.ts:197](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L197)

Obsidion wallet adapter for Aztec protocol
