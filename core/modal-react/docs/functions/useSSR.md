[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSSR

# Function: useSSR()

> **useSSR**(): [`UseSSRReturn`](../interfaces/UseSSRReturn.md)

Defined in: [core/modal-react/src/hooks/useSSR.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useSSR.ts#L53)

Hook for detecting SSR environment and hydration state

Provides comprehensive SSR detection including mount and hydration status.
This is the primary SSR hook exposed by the library.

## Returns

[`UseSSRReturn`](../interfaces/UseSSRReturn.md)

SSR detection state

## Example

```tsx
function MyComponent() {
  const { isServer, isMounted, isHydrated } = useSSR();

  if (isServer) {
    return <div>Server render</div>;
  }

  if (!isHydrated) {
    return <div>Hydrating...</div>;
  }

  return <div>Client render with window access</div>;
}
```
