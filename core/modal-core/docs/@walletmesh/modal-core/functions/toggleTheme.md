[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / toggleTheme

# Function: toggleTheme()

> **toggleTheme**(`current`, `systemTheme`): [`ThemeMode`](../type-aliases/ThemeMode.md)

Toggle between light and dark (skip system)

Simple toggle that only switches between light and dark modes.

## Parameters

### current

[`ThemeMode`](../type-aliases/ThemeMode.md)

Current theme mode

### systemTheme

Current system theme

`"light"` | `"dark"`

## Returns

[`ThemeMode`](../type-aliases/ThemeMode.md)

Toggled theme mode

## Example

```typescript
let theme: ThemeMode = 'light';
theme = toggleTheme(theme, 'dark'); // 'dark'
theme = toggleTheme(theme, 'dark'); // 'light'
```
