[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/utils/validation](../README.md) / validateUrl

# Function: validateUrl()

> **validateUrl**(`url`): `string`

Defined in: [core/modal/src/lib/utils/validation.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/utils/validation.ts#L125)

Validates and normalizes URLs for security.

## Parameters

### url

`string`

URL string to validate and format

## Returns

`string`

Normalized HTTPS URL or empty string if invalid

## Remarks

Security features:
- Forces HTTPS protocol
- Validates URL structure
- Handles malformed URLs gracefully
- Returns empty string for invalid URLs

## Example

```typescript
// Converts to HTTPS and validates
const secureUrl = validateUrl('http://example.com');
// Returns: 'https://example.com'

// Handles invalid URLs
const invalidUrl = validateUrl('not-a-url');
// Returns: ''
```
