[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useClientOnly

# Function: useClientOnly()

> **useClientOnly**\<`T`\>(`clientValue`): `undefined` \| `T`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:304](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/ssr-walletmesh.ts#L304)

Hook that provides a value only on the client-side

Returns undefined during SSR and the provided value after client hydration.

## Type Parameters

### T

`T`

## Parameters

### clientValue

() => `T`

Value to return on client-side

## Returns

`undefined` \| `T`

undefined during SSR, clientValue after hydration

## Example

```typescript
function WindowDimensionsComponent() {
  const windowSize = useClientOnly(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  if (!windowSize) {
    return <div>Loading dimensions...</div>;
  }

  return <div>{windowSize.width} x {windowSize.height}</div>;
}
```
