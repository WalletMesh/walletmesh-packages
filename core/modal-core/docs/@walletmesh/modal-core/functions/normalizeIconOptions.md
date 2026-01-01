[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / normalizeIconOptions

# Function: normalizeIconOptions()

> **normalizeIconOptions**(`options`): [`NormalizedIconOptions`](../interfaces/NormalizedIconOptions.md)

Normalizes icon options with default values

## Parameters

### options

[`CreateSandboxedIconOptions`](../interfaces/CreateSandboxedIconOptions.md)

Raw icon options from framework components

## Returns

[`NormalizedIconOptions`](../interfaces/NormalizedIconOptions.md)

Normalized options with all defaults applied

## Example

```typescript
const normalized = normalizeIconOptions({
  iconDataUri: 'data:image/svg+xml,...',
  // size will default to 24
  // timeout will default to 3000
});
```
