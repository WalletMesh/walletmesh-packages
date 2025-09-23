[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createLazyProxy

# Function: createLazyProxy()

> **createLazyProxy**\<`T`\>(`factory`): `T`

Create a lazy proxy that initializes on first property access

This creates a proxy object that delays initialization until the first
time any property is accessed. Useful for complex objects with browser
dependencies.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### factory

() => `T`

Factory function to create the target object

## Returns

`T`

Proxy that initializes on first access

## Example

```typescript
const controller = createLazyProxy(() => {
  // This code won't run until first property access
  return new ModalController({
    eventEmitter: new EventTarget(),
    // ... other browser-dependent config
  });
});

// Later, when actually used
controller.open(); // Initialization happens here
```
