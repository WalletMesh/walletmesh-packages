[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createSafeStorage

# Function: createSafeStorage()

> **createSafeStorage**(`type`): `Storage`

Create a safe storage wrapper that works in all environments

## Parameters

### type

Storage type to create wrapper for ('local' or 'session')

`"session"` | `"local"`

## Returns

`Storage`

Safe storage interface that won't throw errors

## Remarks

This function creates a Storage-compatible wrapper that gracefully handles
environments where storage is unavailable (SSR, private browsing, etc.). All methods
are no-op when storage is unavailable, preventing runtime errors

## Example

```typescript
const storage = createSafeStorage('local');
storage.setItem('key', 'value'); // Won't throw even if localStorage is unavailable
const value = storage.getItem('key'); // Returns null if unavailable
```
