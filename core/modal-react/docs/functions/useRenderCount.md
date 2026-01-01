[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useRenderCount

# Function: useRenderCount()

> **useRenderCount**(`componentName`, `logThreshold`): `number`

Defined in: [core/modal-react/src/utils/performance.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/utils/performance.ts#L29)

Hook to track component render count
Useful for identifying components that re-render too frequently

## Parameters

### componentName

`string`

Name of the component for logging

### logThreshold

`number` = `Number.POSITIVE_INFINITY`

Only log when render count exceeds this threshold

## Returns

`number`

Current render count

## Example

```tsx
function MyComponent() {
  const renderCount = useRenderCount('MyComponent', 10);
  // Component will log a warning if it renders more than 10 times
  return <div>Render #{renderCount}</div>;
}
```
