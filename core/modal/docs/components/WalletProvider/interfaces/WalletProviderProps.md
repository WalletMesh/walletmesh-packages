[**@walletmesh/modal v0.0.6**](../../../README.md)

***

[@walletmesh/modal](../../../modules.md) / [components/WalletProvider](../README.md) / WalletProviderProps

# Interface: WalletProviderProps

Defined in: [core/modal/src/components/WalletProvider.tsx:17](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/components/WalletProvider.tsx#L17)

Props for the WalletProvider component
 WalletProviderProps

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal/src/components/WalletProvider.tsx:18](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/components/WalletProvider.tsx#L18)

Child components to render inside the provider

***

### config

> **config**: [`WalletMeshProviderConfig`](../../../index/interfaces/WalletMeshProviderConfig.md)

Defined in: [core/modal/src/components/WalletProvider.tsx:19](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/components/WalletProvider.tsx#L19)

WalletMesh configuration including wallet and dapp settings

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal/src/components/WalletProvider.tsx:20](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/components/WalletProvider.tsx#L20)

Optional error handler for wallet-related errors

#### Parameters

##### error

`Error`

#### Returns

`void`
