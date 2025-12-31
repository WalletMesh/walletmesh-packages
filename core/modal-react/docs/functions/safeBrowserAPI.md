[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / safeBrowserAPI

# Function: safeBrowserAPI()

> **safeBrowserAPI**\<`T`\>(`fn`, `fallback`): `T`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:327](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/utils/ssr-walletmesh.ts#L327)

Safe wrapper for browser APIs that may not be available during SSR

## Type Parameters

### T

`T`

## Parameters

### fn

() => `T`

Function that uses browser APIs

### fallback

`T`

Fallback value for SSR

## Returns

`T`

Result of fn() on client, fallback on server

## Example

```typescript
const currentUrl = safeBrowserAPI(
  () => window.location.href,
  'https://example.com'
);
```
