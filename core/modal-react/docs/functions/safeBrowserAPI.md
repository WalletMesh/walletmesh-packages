[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / safeBrowserAPI

# Function: safeBrowserAPI()

> **safeBrowserAPI**\<`T`\>(`fn`, `fallback`): `T`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:327](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/utils/ssr-walletmesh.ts#L327)

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
