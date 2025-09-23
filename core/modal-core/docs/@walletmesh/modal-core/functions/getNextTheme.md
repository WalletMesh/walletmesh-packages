[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getNextTheme

# Function: getNextTheme()

> **getNextTheme**(`current`): [`ThemeMode`](../type-aliases/ThemeMode.md)

Get the next theme in rotation (for toggle functionality)

Cycles through: light → dark → system → light

## Parameters

### current

[`ThemeMode`](../type-aliases/ThemeMode.md)

Current theme mode

## Returns

[`ThemeMode`](../type-aliases/ThemeMode.md)

Next theme mode in rotation

## Example

```typescript
let theme: ThemeMode = 'light';
theme = getNextTheme(theme); // 'dark'
theme = getNextTheme(theme); // 'system'
theme = getNextTheme(theme); // 'light'
```
