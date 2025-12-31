[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createLazyAsync

# Function: createLazyAsync()

> **createLazyAsync**\<`T`\>(`factory`): () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Create a lazily initialized async value

Similar to createLazy but for async factory functions. The promise is
cached after first call. If the promise rejects, the cache is cleared
to allow retry on subsequent calls.

## Type Parameters

### T

`T`

## Parameters

### factory

() => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Async factory function

## Returns

Getter function that returns the promise

> (): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

## Example

```typescript
const getWalletList = createLazyAsync(async () => {
  const response = await fetch('/api/wallets');
  return response.json();
});

// First call triggers the fetch
const wallets = await getWalletList();
// Subsequent calls return the same promise (if successful)
const sameWallets = await getWalletList();
// If first call failed, retry is possible
```
