[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createLazy

# Function: createLazy()

> **createLazy**\<`T`\>(`factory`): () => `T`

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
