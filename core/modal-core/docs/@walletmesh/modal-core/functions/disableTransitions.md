[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / disableTransitions

# Function: disableTransitions()

> **disableTransitions**(`duration`): () => `void`

Disable transitions temporarily to prevent flashing

Useful when switching themes to prevent visual glitches.

## Parameters

### duration

`number` = `100`

Duration to disable transitions (ms, default: 100)

## Returns

Cleanup function to re-enable transitions

> (): `void`

### Returns

`void`

## Example

```typescript
const cleanup = disableTransitions();
applyTheme('dark');
// Transitions re-enabled after 100ms or when cleanup() is called
```
