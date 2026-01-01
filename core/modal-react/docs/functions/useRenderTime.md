[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useRenderTime

# Function: useRenderTime()

> **useRenderTime**(`componentName`, `warnThreshold`): `number`

Defined in: [core/modal-react/src/utils/performance.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/utils/performance.ts#L113)

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
