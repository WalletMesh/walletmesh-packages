[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshProviderProps

# Interface: WalletMeshProviderProps

Defined in: [core/modal-react/src/types.ts:401](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L401)

Props for the WalletMeshProvider component.

Defines the configuration and children required for the WalletMesh React provider.
The provider component uses these props to initialize the WalletMesh client and
provide wallet functionality throughout the React component tree.

## Example

```tsx
const providerProps: WalletMeshProviderProps = {
  children: <App />,
  config: {
    appName: 'My DApp',
    chains: ['evm', 'solana'],
    wallets: ['metamask', 'phantom']
  }
};

<WalletMeshProvider {...providerProps} />
```

## See

 - [WalletMeshProvider](../functions/WalletMeshProvider.md) For the component that uses these props
 - [WalletMeshReactConfig](WalletMeshReactConfig.md) For detailed configuration options

## Since

1.0.0

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal-react/src/types.ts:406](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L406)

React children to render within the WalletMesh provider context.
All children will have access to WalletMesh functionality through hooks.

***

### config

> **config**: [`WalletMeshReactConfig`](WalletMeshReactConfig.md)

Defined in: [core/modal-react/src/types.ts:412](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L412)

WalletMesh configuration object with React-specific extensions.
Supports simplified configuration formats that are automatically transformed.

***

### queryClient?

> `optional` **queryClient**: `QueryClient`

Defined in: [core/modal-react/src/types.ts:418](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L418)

Optional QueryClient instance from @tanstack/react-query.
If not provided, the provider will use the QueryClient from modal-core.
