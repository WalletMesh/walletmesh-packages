[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / AdapterType

# Enumeration: AdapterType

Defined in: [core/modal/src/lib/adapters/types.ts:195](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L195)

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

Defined in: [core/modal/src/lib/adapters/types.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L196)

WalletMesh adapter for Aztec protocol

***

### ObsidionAztec

> **ObsidionAztec**: `"obsidion_aztec"`

Defined in: [core/modal/src/lib/adapters/types.ts:197](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L197)

Obsidion wallet adapter for Aztec protocol
