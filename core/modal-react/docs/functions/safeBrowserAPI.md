[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / safeBrowserAPI

# Function: safeBrowserAPI()

> **safeBrowserAPI**\<`T`\>(`fn`, `fallback`): `T`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:327](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/utils/ssr-walletmesh.ts#L327)

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
