[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / safeBrowserAPI

# Function: safeBrowserAPI()

> **safeBrowserAPI**\<`T`\>(`fn`, `fallback`): `T`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:327](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/utils/ssr-walletmesh.ts#L327)

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
