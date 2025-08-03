[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / validateOrigin

# Function: validateOrigin()

> **validateOrigin**(`origin`, `policy?`): [`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Defined in: [security/OriginValidator.ts:536](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/OriginValidator.ts#L536)

Convenience function to validate an origin with configurable policy.

Creates a temporary OriginValidator instance and validates the specified
origin. Useful for one-off validations without maintaining validator state.

## Parameters

### origin

`string`

Origin URL to validate

### policy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Optional security policy (uses defaults if not provided)

## Returns

[`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Validation result with status and optional failure reason

## Example

```typescript
// Quick validation with default policy
const result = validateOrigin('https://example.com');

// Validation with custom policy
const result = validateOrigin('http://localhost:3000', {
  requireHttps: false,
  allowLocalhost: true
});
```

## Since

0.1.0

## See

[OriginValidator.validateOrigin](../classes/OriginValidator.md#validateorigin) for instance method
