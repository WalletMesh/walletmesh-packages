[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createLazyAsync

# Function: createLazyAsync()

> **createLazyAsync**\<`T`\>(`factory`): () => `Promise`\<`T`\>

Defined in: core/modal-core/dist/api/utils/lazy.d.ts:56

Create a lazily initialized async value

Similar to createLazy but for async factory functions. The promise is
cached after first call. If the promise rejects, the cache is cleared
to allow retry on subsequent calls.

## Type Parameters

### T

`T`

## Parameters

### factory

() => `Promise`\<`T`\>

Async factory function

## Returns

Getter function that returns the promise

> (): `Promise`\<`T`\>

### Returns

`Promise`\<`T`\>

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
