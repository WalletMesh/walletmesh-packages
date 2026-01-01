[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / removeCSSVariables

# Function: removeCSSVariables()

> **removeCSSVariables**(`variableNames`, `element?`): `void`

Remove CSS variables from document root

## Parameters

### variableNames

`string`[]

Names of CSS variables to remove

### element?

`HTMLElement`

Target element (default: document.documentElement)

## Returns

`void`

## Example

```typescript
removeCSSVariables(['--wm-color-primary', '--wm-color-secondary']);
// CSS variables removed from document root
```
