[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/config/WalletMeshConfig](../README.md) / WalletMeshProviderConfig

# Interface: WalletMeshProviderConfig

Defined in: [core/modal/src/lib/config/WalletMeshConfig.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/config/WalletMeshConfig.ts#L48)

Configuration object for WalletMesh provider initialization.

Defines the complete configuration required to initialize a WalletMesh
provider, including supported wallets, dApp information, chain support,
and operation timeouts.

## Remarks

Security considerations:
- Icons must be data URIs to prevent XSS
- Origins should be explicitly specified
- Chain IDs should be validated

## Example

```typescript
const config: WalletMeshProviderConfig = {
  wallets: [
    {
      id: 'my-wallet',
      name: 'My Wallet',
      icon: 'data:image/svg+xml,...',
      transport: { type: 'postMessage' },
      adapter: { type: 'wm_aztec' }
    }
  ],
  dappInfo: {
    name: 'My dApp',
    icon: 'data:image/svg+xml,...',
    origin: 'https://mydapp.com'
  },
  supportedChains: ['aztec:testnet'],
  timeoutConfig: {
    connectionTimeout: 30000
  }
};
```

## Properties

### wallets

> **wallets**: [`WalletInfo`](../../../../index/interfaces/WalletInfo.md)[]

Defined in: [core/modal/src/lib/config/WalletMeshConfig.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/config/WalletMeshConfig.ts#L49)

List of supported wallet configurations

***

### dappInfo

> **dappInfo**: [`DappInfo`](../../../../index/interfaces/DappInfo.md)

Defined in: [core/modal/src/lib/config/WalletMeshConfig.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/config/WalletMeshConfig.ts#L50)

Information about the dApp for wallet display

***

### supportedChains

> **supportedChains**: `undefined` \| `string`[]

Defined in: [core/modal/src/lib/config/WalletMeshConfig.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/config/WalletMeshConfig.ts#L51)

Optional list of supported chain IDs

***

### timeoutConfig?

> `optional` **timeoutConfig**: [`TimeoutConfig`](../../../utils/timeout/interfaces/TimeoutConfig.md)

Defined in: [core/modal/src/lib/config/WalletMeshConfig.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/config/WalletMeshConfig.ts#L52)

Optional timeout configuration
