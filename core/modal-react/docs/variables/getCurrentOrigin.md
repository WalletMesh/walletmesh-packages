[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / getCurrentOrigin

# Variable: getCurrentOrigin()

> `const` **getCurrentOrigin**: () => `string` \| `undefined`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:165

Get the current origin in a safe way

## Returns

`string` \| `undefined`

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
