[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useClientOnly

# Function: useClientOnly()

> **useClientOnly**\<`T`\>(`clientValue`): `undefined` \| `T`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:304](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/utils/ssr-walletmesh.ts#L304)

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
