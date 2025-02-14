[**@walletmesh/modal v0.0.6**](../../../README.md)

***

[@walletmesh/modal](../../../modules.md) / [components/WalletProvider](../README.md) / WalletProviderProps

# Interface: WalletProviderProps

Defined in: [core/modal/src/components/WalletProvider.tsx:16](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/components/WalletProvider.tsx#L16)

Props for the WalletProvider component
 WalletProviderProps

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal/src/components/WalletProvider.tsx:17](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/components/WalletProvider.tsx#L17)

Child components to render inside the provider

***

### config

> **config**: [`WalletMeshProviderConfig`](../../../lib/config/WalletMeshConfig/interfaces/WalletMeshProviderConfig.md)

Defined in: [core/modal/src/components/WalletProvider.tsx:18](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/components/WalletProvider.tsx#L18)

WalletMesh configuration including wallet and dapp settings

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal/src/components/WalletProvider.tsx:19](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/components/WalletProvider.tsx#L19)

Optional error handler for wallet-related errors

#### Parameters

##### error

`Error`

#### Returns

`void`
