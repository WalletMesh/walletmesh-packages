[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useLifecycleProfiler

# Function: useLifecycleProfiler()

> **useLifecycleProfiler**(`componentName`): `void`

Defined in: [core/modal-react/src/utils/performance.ts:188](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/utils/performance.ts#L188)

Hook to profile component lifecycle
Tracks mount, update, and unmount with timing information

## Parameters

### componentName

`string`

Name of the component

## Returns

`void`

## Example

```tsx
function MyComponent() {
  useLifecycleProfiler('MyComponent');
  // Will log mount time, update count, and unmount
}
```
