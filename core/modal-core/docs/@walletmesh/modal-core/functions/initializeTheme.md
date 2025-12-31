[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / initializeTheme

# Function: initializeTheme()

> **initializeTheme**(`storageKey`, `cssPrefix`, `disableTransitionsOnLoad`): `"light"` \| `"dark"`

Initialize theme on page load

Detects stored preference or system theme and applies it to the document.

## Parameters

### storageKey

`string` = `DEFAULT_THEME_STORAGE_KEY`

localStorage key for theme preference

### cssPrefix

`string` = `DEFAULT_CSS_PREFIX`

CSS class/variable prefix

### disableTransitionsOnLoad

`boolean` = `true`

Whether to disable transitions during initialization

## Returns

`"light"` \| `"dark"`

The applied theme

## Example

```typescript
// On app initialization
const initialTheme = initializeTheme();
console.log('Applied theme:', initialTheme);
```
