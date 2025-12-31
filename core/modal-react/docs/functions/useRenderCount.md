[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useRenderCount

# Function: useRenderCount()

> **useRenderCount**(`componentName`, `logThreshold`): `number`

Defined in: [core/modal-react/src/utils/performance.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/performance.ts#L29)

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
