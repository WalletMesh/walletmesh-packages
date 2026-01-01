[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletMeshContext

# Function: useWalletMeshContext()

> **useWalletMeshContext**(): [`InternalContextValue`](../interfaces/InternalContextValue.md)

Defined in: [core/modal-react/src/WalletMeshContext.tsx:62](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/WalletMeshContext.tsx#L62)

Hook to access the WalletMesh context value

## Returns

[`InternalContextValue`](../interfaces/InternalContextValue.md)

The WalletMesh context value

## Throws

If used outside of WalletMeshProvider

## Example

```tsx
function MyComponent() {
  const { client, config } = useWalletMeshContext();
  // Use client and config
}
```
