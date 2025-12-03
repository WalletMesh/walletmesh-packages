[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useBatchedUpdates

# Function: useBatchedUpdates()

> **useBatchedUpdates**(`callback`): () => `void`

Defined in: [core/modal-react/src/utils/performance.ts:283](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/utils/performance.ts#L283)

Hook to batch multiple state updates
Helps reduce re-renders by batching updates together

## Parameters

### callback

() => `void`

Function containing state updates

## Returns

Function to trigger batched updates

> (): `void`

### Returns

`void`

## Example

```tsx
function MyComponent() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  const batchUpdate = useBatchedUpdates(() => {
    setA(1);
    setB(2);
    // Both updates will cause only one re-render
  });
}
```
