[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWhyDidYouUpdate

# Function: useWhyDidYouUpdate()

> **useWhyDidYouUpdate**\<`T`\>(`name`, `props`): `void`

Defined in: [core/modal-react/src/utils/performance.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/performance.ts#L66)

Hook to track why a component re-rendered
Compares current props with previous props to identify changes

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

## Parameters

### name

`string`

Component name for logging

### props

`T`

Current props to track

## Returns

`void`

## Example

```tsx
function MyComponent({ user, settings, onUpdate }) {
  useWhyDidYouUpdate('MyComponent', { user, settings, onUpdate });
  // Will log which props changed between renders
  return <div>{user.name}</div>;
}
```
