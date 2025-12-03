[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / applyThemeClass

# Function: applyThemeClass()

> **applyThemeClass**(`theme`, `prefix`, `element?`): `void`

Apply theme class to document

Adds theme class and data attribute to the target element for CSS styling.

## Parameters

### theme

Theme to apply ('light' or 'dark')

`"light"` | `"dark"`

### prefix

`string` = `DEFAULT_CSS_PREFIX`

Class/attribute prefix (default: 'wm')

### element?

`HTMLElement`

Target element (default: document.documentElement)

## Returns

`void`

## Example

```typescript
applyThemeClass('dark');
// Adds 'wm-theme-dark' class and data-wm-theme="dark" attribute
```
