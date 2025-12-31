[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createLazySingleton

# Function: createLazySingleton()

> **createLazySingleton**\<`T`\>(`factory`): `object`

Defined in: core/modal-core/dist/api/utils/lazy.d.ts:106

Create a singleton factory with lazy initialization

This ensures that only one instance is created, and it's created
lazily on first access.

## Type Parameters

### T

`T`

## Parameters

### factory

() => `T`

Factory function

## Returns

`object`

Singleton manager

### getInstance()

> **getInstance**: () => `T`

#### Returns

`T`

### reset()

> **reset**: () => `void`

#### Returns

`void`

## Example

```typescript
const modalSingleton = createLazySingleton(() => createModal({
  // configuration
}));

// Get the singleton instance
const modal = modalSingleton.getInstance();

// Reset for testing
modalSingleton.reset();
```
