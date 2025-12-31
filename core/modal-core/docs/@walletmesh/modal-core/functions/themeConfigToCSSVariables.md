[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / themeConfigToCSSVariables

# Function: themeConfigToCSSVariables()

> **themeConfigToCSSVariables**(`config`, `prefix`): [`ThemeCSSVariables`](../type-aliases/ThemeCSSVariables.md)

Convert theme configuration to CSS custom properties

Transforms a theme configuration object into CSS custom properties
that can be applied to the document.

## Parameters

### config

[`ThemeConfig`](../interfaces/ThemeConfig.md)

Theme configuration

### prefix

`string` = `DEFAULT_CSS_PREFIX`

CSS variable prefix (default: 'wm')

## Returns

[`ThemeCSSVariables`](../type-aliases/ThemeCSSVariables.md)

Object with CSS custom properties

## Example

```typescript
const cssVars = themeConfigToCSSVariables(lightTheme);
// Returns: { '--wm-color-primary': '#000', ... }
```
