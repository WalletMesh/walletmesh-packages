[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / resolveTheme

# Function: resolveTheme()

> **resolveTheme**(`mode`, `systemTheme`): `"light"` \| `"dark"`

Resolve theme mode to actual theme

Converts 'system' to the actual system theme preference.

## Parameters

### mode

[`ThemeMode`](../type-aliases/ThemeMode.md)

Theme mode to resolve

### systemTheme

Current system theme (default: auto-detected)

`"light"` | `"dark"`

## Returns

`"light"` \| `"dark"`

Resolved theme ('light' or 'dark')

## Example

```typescript
const actualTheme = resolveTheme('system');
// Returns 'dark' if system prefers dark mode, 'light' otherwise
```
