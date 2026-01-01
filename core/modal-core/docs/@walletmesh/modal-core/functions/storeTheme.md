[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / storeTheme

# Function: storeTheme()

> **storeTheme**(`mode`, `storageKey`): `void`

Store theme preference in localStorage

## Parameters

### mode

[`ThemeMode`](../type-aliases/ThemeMode.md)

Theme mode to store

### storageKey

`string` = `DEFAULT_THEME_STORAGE_KEY`

Key to use for localStorage (default: 'walletmesh-theme')

## Returns

`void`

## Example

```typescript
storeTheme('dark');
// Theme preference saved to localStorage
```
