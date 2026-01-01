[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createLazySingleton

# Function: createLazySingleton()

> **createLazySingleton**\<`T`\>(`factory`): `object`

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
