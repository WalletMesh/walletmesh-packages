[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getStoredTheme

# Function: getStoredTheme()

> **getStoredTheme**(`storageKey`): `null` \| [`ThemeMode`](../type-aliases/ThemeMode.md)

Get stored theme preference from localStorage

## Parameters

### storageKey

`string` = `DEFAULT_THEME_STORAGE_KEY`

Key to use for localStorage (default: 'walletmesh-theme')

## Returns

`null` \| [`ThemeMode`](../type-aliases/ThemeMode.md)

Stored theme mode or null if not found

## Example

```typescript
const storedTheme = getStoredTheme();
if (storedTheme) {
  applyTheme(storedTheme);
}
```
