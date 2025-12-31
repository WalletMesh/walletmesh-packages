[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecWalletMeshProviderProps

# Interface: AztecWalletMeshProviderProps

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:182](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L182)

Props for AztecWalletMeshProvider

## Extends

- `Omit`\<[`WalletMeshProviderProps`](WalletMeshProviderProps.md), `"config"`\>

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal-react/src/types.ts:539](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L539)

React children to render within the WalletMesh provider context.
All children will have access to WalletMesh functionality through hooks.

#### Inherited from

[`WalletMeshProviderProps`](WalletMeshProviderProps.md).[`children`](WalletMeshProviderProps.md#children)

***

### config

> **config**: [`AztecProviderConfig`](AztecProviderConfig.md)

Defined in: [core/modal-react/src/components/AztecWalletMeshProvider.tsx:184](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/AztecWalletMeshProvider.tsx#L184)

Aztec-specific configuration

***

### queryClient?

> `optional` **queryClient**: `QueryClient`

Defined in: [core/modal-react/src/types.ts:551](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L551)

Optional QueryClient instance from @tanstack/react-query.
If not provided, the provider will use the QueryClient from modal-core.

#### Inherited from

[`WalletMeshProviderProps`](WalletMeshProviderProps.md).[`queryClient`](WalletMeshProviderProps.md#queryclient)
