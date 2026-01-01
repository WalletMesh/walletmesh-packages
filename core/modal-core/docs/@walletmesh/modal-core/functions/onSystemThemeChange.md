[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / onSystemThemeChange

# Function: onSystemThemeChange()

> **onSystemThemeChange**(`callback`): () => `void`

Listen for system theme changes

## Parameters

### callback

(`theme`) => `void`

Function to call when system theme changes

## Returns

Cleanup function to remove the listener

> (): `void`

### Returns

`void`

## Example

```typescript
const cleanup = onSystemThemeChange((theme) => {
  console.log('System theme changed to:', theme);
  applyTheme(theme);
});

// Later, clean up the listener
cleanup();
```
