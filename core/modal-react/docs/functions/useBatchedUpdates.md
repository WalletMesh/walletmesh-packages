[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useBatchedUpdates

# Function: useBatchedUpdates()

> **useBatchedUpdates**(`callback`): () => `void`

Defined in: [core/modal-react/src/utils/performance.ts:283](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/utils/performance.ts#L283)

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
