[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EventListener

# Type Alias: EventListener()

> **EventListener** = (`event`) => `void`

Defined in: core/modal-core/dist/types.d.ts:1014

Type for event listener functions

## Parameters

### event

`unknown`

## Returns

`void`

## Remarks

Generic event listener type used throughout the framework.
Event listeners receive event data and perform side effects without returning values.
This type provides a consistent signature for all event handling in the modal system,
allowing for flexible event payloads while maintaining type safety where needed.

## Examples

```typescript
const listener: EventListener = (event) => {
  console.log('Event received:', event);
};

// Subscribe to events
const unsubscribe = emitter.on('change', listener);

// Later, unsubscribe
unsubscribe();
```

```typescript
// Type-safe event listener with type assertion
const accountListener: EventListener = (event) => {
  const { accounts } = event as { accounts: string[] };
  console.log('New accounts:', accounts);
};

wallet.on('accountsChanged', accountListener);
```
