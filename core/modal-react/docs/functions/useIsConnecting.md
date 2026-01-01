[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsConnecting

# Function: useIsConnecting()

> **useIsConnecting**(): `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:770](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L770)

Hook to check connection loading state

Simple boolean hook for checking if currently connecting.

## Returns

`boolean`

True if connecting, false otherwise

## Since

1.0.0

## Example

```tsx
function App() {
  const isConnecting = useIsConnecting();

  if (isConnecting) {
    return <LoadingSpinner />;
  }

  return <MainContent />;
}
```
