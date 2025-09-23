[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsConnecting

# Function: useIsConnecting()

> **useIsConnecting**(): `boolean`

Defined in: [core/modal-react/src/hooks/useConnect.ts:746](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L746)

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
