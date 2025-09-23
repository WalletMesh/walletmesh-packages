[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useLifecycleProfiler

# Function: useLifecycleProfiler()

> **useLifecycleProfiler**(`componentName`): `void`

Defined in: [core/modal-react/src/utils/performance.ts:188](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/utils/performance.ts#L188)

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
