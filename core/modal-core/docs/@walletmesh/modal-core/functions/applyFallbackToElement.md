[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / applyFallbackToElement

# Function: applyFallbackToElement()

> **applyFallbackToElement**(`element`, `config`): `void`

Utility to apply fallback configuration to a DOM element

## Parameters

### element

`HTMLElement`

DOM element to configure

### config

[`FallbackIconConfig`](../interfaces/FallbackIconConfig.md)

Fallback configuration to apply

## Returns

`void`

## Example

```typescript
const div = document.createElement('div');
const config = createFallbackConfig({ size: 24, alt: 'MetaMask' });
applyFallbackToElement(div, config);
```
