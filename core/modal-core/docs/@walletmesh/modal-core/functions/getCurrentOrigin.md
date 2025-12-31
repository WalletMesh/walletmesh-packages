[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getCurrentOrigin

# Function: getCurrentOrigin()

> **getCurrentOrigin**(): `undefined` \| `string`

Get the current origin in a safe way

## Returns

`undefined` \| `string`

The current origin (protocol + domain + port) or undefined if not available

## Remarks

Safely retrieves the current page's origin. Returns undefined on server or if
access to location.origin fails (rare edge cases)

## Example

```typescript
const origin = getCurrentOrigin();
if (origin) {
  console.log(`Running on: ${origin}`);
  // e.g., "https://example.com:3000"
}
```
