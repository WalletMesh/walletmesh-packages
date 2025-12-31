[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useValueTracker

# Function: useValueTracker()

> **useValueTracker**\<`T`\>(`label`, `value`, `logChanges`): `void`

Defined in: [core/modal-react/src/utils/performance.ts:152](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/performance.ts#L152)

Hook to track updates to a specific value
Useful for debugging when a value changes unexpectedly

## Type Parameters

### T

`T`

## Parameters

### label

`string`

Label for the value being tracked

### value

`T`

The value to track

### logChanges

`boolean` = `true`

Whether to log changes

## Returns

`void`

## Example

```tsx
function MyComponent({ userId }) {
  useValueTracker('userId', userId);
  // Will log whenever userId changes
}
```
