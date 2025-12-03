[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsConnecting

# Function: useIsConnecting()

> **useIsConnecting**(): `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:755](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConnect.ts#L755)

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
