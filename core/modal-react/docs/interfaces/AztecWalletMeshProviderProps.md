[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecWalletMeshProviderProps

# Interface: AztecWalletMeshProviderProps

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:137](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L137)

Props for AztecWalletMeshProvider

## Extends

- `Omit`\<[`WalletMeshProviderProps`](WalletMeshProviderProps.md), `"config"`\>

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal-react/src/types.ts:406](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L406)

React children to render within the WalletMesh provider context.
All children will have access to WalletMesh functionality through hooks.

#### Inherited from

[`WalletMeshProviderProps`](WalletMeshProviderProps.md).[`children`](WalletMeshProviderProps.md#children)

***

### config

> **config**: [`AztecProviderConfig`](AztecProviderConfig.md)

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:139](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L139)

Aztec-specific configuration

***

### queryClient?

> `optional` **queryClient**: `QueryClient`

Defined in: [core/modal-react/src/types.ts:418](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L418)

Optional QueryClient instance from @tanstack/react-query.
If not provided, the provider will use the QueryClient from modal-core.

#### Inherited from

[`WalletMeshProviderProps`](WalletMeshProviderProps.md).[`queryClient`](WalletMeshProviderProps.md#queryclient)
