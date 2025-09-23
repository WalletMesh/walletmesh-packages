[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useRenderTime

# Function: useRenderTime()

> **useRenderTime**(`componentName`, `warnThreshold`): `number`

Defined in: [core/modal-react/src/utils/performance.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/utils/performance.ts#L113)

Hook to measure render time
Tracks how long each render takes and warns about slow renders

## Parameters

### componentName

`string`

Name of the component

### warnThreshold

`number` = `16`

Warn if render takes longer than this (ms)

## Returns

`number`

Render time in milliseconds

## Example

```tsx
function ExpensiveComponent() {
  const renderTime = useRenderTime('ExpensiveComponent', 16); // Warn if > 16ms
  return <ComplexVisualization />;
}
```
