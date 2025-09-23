[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createLazyAsync

# Function: createLazyAsync()

> **createLazyAsync**\<`T`\>(`factory`): () => `Promise`\<`T`\>

Defined in: core/modal-core/dist/api/utils/lazy.d.ts:54

Create a lazily initialized async value

Similar to createLazy but for async factory functions. The promise is
cached after first call.

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
// Subsequent calls return the same promise
const sameWallets = await getWalletList();
```
