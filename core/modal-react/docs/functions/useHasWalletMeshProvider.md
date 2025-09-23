[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useHasWalletMeshProvider

# Function: useHasWalletMeshProvider()

> **useHasWalletMeshProvider**(): `boolean`

Defined in: [core/modal-react/src/WalletMeshContext.tsx:95](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/WalletMeshContext.tsx#L95)

Hook to check if running inside WalletMeshProvider

## Returns

`boolean`

True if inside provider, false otherwise

## Example

```tsx
function OptionalWalletComponent() {
  const hasWallet = useHasWalletMeshProvider();

  if (!hasWallet) {
    return <div>Wallet not available</div>;
  }

  return <ConnectedComponent />;
}
```
