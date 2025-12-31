[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / safeBrowserAPI

# Function: safeBrowserAPI()

> **safeBrowserAPI**\<`T`\>(`fn`, `fallback`): `T`

Safe wrapper for browser APIs that may not be available during SSR

Executes the provided function only if running in a browser environment,
otherwise returns the fallback value. Also includes error handling for
cases where browser APIs might fail.

## Type Parameters

### T

`T`

## Parameters

### fn

() => `T`

Function that uses browser APIs

### fallback

`T`

Fallback value for SSR or when function fails

## Returns

`T`

Result of fn() on client, fallback on server or error

## Example

```typescript
// Get current URL safely
const currentUrl = safeBrowserAPI(
  () => window.location.href,
  'https://example.com'
);

// Get localStorage value safely
const theme = safeBrowserAPI(
  () => localStorage.getItem('theme'),
  'light'
);

// Get viewport dimensions safely
const dimensions = safeBrowserAPI(
  () => ({ width: window.innerWidth, height: window.innerHeight }),
  { width: 1920, height: 1080 }
);
```

## Since

3.0.0
