[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createLazy

# Function: createLazy()

> **createLazy**\<`T`\>(`factory`): () => `T`

Defined in: core/modal-core/dist/api/utils/lazy.d.ts:30

Create a lazily initialized value

The factory function is only called on first access, not at creation time.
This is useful for browser APIs that shouldn't be accessed during SSR.

## Type Parameters

### T

`T`

## Parameters

### factory

() => `T`

Factory function to create the value

## Returns

Getter function that returns the lazily initialized value

> (): `T`

### Returns

`T`

## Example

```typescript
// Create a lazy storage instance
const getStorage = createLazy(() => window.localStorage);

// Later, when actually needed (not during import)
const storage = getStorage();
```
