[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useHasMounted

# Function: useHasMounted()

> **useHasMounted**(): `boolean`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:270](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/ssr-walletmesh.ts#L270)

Hook for detecting when component has mounted on client-side

Useful for conditionally rendering browser-only content while maintaining
SSR compatibility.

## Returns

`boolean`

true if component has mounted on client, false during SSR or before mount

## Example

```typescript
function BrowserOnlyComponent() {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return <div>Loading...</div>; // SSR fallback
  }

  return <div>Client-side content</div>;
}
```
