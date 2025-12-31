[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsConnecting

# Function: useIsConnecting()

> **useIsConnecting**(): `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:770](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useConnect.ts#L770)

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
