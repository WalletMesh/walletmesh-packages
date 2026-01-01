[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / applyCSSVariables

# Function: applyCSSVariables()

> **applyCSSVariables**(`variables`, `element?`): `void`

Apply CSS variables to document root

## Parameters

### variables

[`ThemeCSSVariables`](../type-aliases/ThemeCSSVariables.md)

CSS custom properties to apply

### element?

`HTMLElement`

Target element (default: document.documentElement)

## Returns

`void`

## Example

```typescript
const cssVars = themeConfigToCSSVariables(darkTheme);
applyCSSVariables(cssVars);
// CSS variables applied to document root
```
