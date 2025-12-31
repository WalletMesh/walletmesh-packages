[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useLifecycleProfiler

# Function: useLifecycleProfiler()

> **useLifecycleProfiler**(`componentName`): `void`

Defined in: [core/modal-react/src/utils/performance.ts:188](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/performance.ts#L188)

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
