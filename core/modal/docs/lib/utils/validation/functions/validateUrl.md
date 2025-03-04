[**@walletmesh/modal v0.0.7**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/utils/validation](../README.md) / validateUrl

# Function: validateUrl()

> **validateUrl**(`url`): `string`

Defined in: [core/modal/src/lib/utils/validation.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/utils/validation.ts#L125)

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
