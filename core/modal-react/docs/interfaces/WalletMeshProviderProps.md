[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshProviderProps

# Interface: WalletMeshProviderProps

Defined in: [core/modal-react/src/types.ts:534](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L534)

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

Defined in: [core/modal-react/src/types.ts:539](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L539)

React children to render within the WalletMesh provider context.
All children will have access to WalletMesh functionality through hooks.

***

### config

> **config**: [`WalletMeshReactConfig`](WalletMeshReactConfig.md)

Defined in: [core/modal-react/src/types.ts:545](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L545)

WalletMesh configuration object with React-specific extensions.
Supports simplified configuration formats that are automatically transformed.

***

### queryClient?

> `optional` **queryClient**: `QueryClient`

Defined in: [core/modal-react/src/types.ts:551](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L551)

Optional QueryClient instance from @tanstack/react-query.
If not provided, the provider will use the QueryClient from modal-core.
