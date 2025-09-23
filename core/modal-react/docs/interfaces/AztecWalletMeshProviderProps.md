[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecWalletMeshProviderProps

# Interface: AztecWalletMeshProviderProps

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:62](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L62)

Props for AztecWalletMeshProvider

## Extends

- `Omit`\<[`WalletMeshProviderProps`](WalletMeshProviderProps.md), `"config"`\>

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal-react/src/types.ts:406](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L406)

React children to render within the WalletMesh provider context.
All children will have access to WalletMesh functionality through hooks.

#### Inherited from

[`WalletMeshProviderProps`](WalletMeshProviderProps.md).[`children`](WalletMeshProviderProps.md#children)

***

### config

> **config**: [`AztecProviderConfig`](AztecProviderConfig.md)

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:64](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L64)

Aztec-specific configuration

***

### queryClient?

> `optional` **queryClient**: `QueryClient`

Defined in: [core/modal-react/src/types.ts:418](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L418)

Optional QueryClient instance from @tanstack/react-query.
If not provided, the provider will use the QueryClient from modal-core.

#### Inherited from

[`WalletMeshProviderProps`](WalletMeshProviderProps.md).[`queryClient`](WalletMeshProviderProps.md#queryclient)
