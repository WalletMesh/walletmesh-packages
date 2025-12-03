[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isBrowserExtension

# Variable: isBrowserExtension()

> `const` **isBrowserExtension**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:115

Check if browser extension APIs are available

## Returns

`boolean`

True if running in a browser extension context

## Remarks

Detects if the code is running inside a browser extension by checking for
the chrome.runtime.id property. Works for Chrome, Edge, and other Chromium-based browsers

## Example

```typescript
if (isBrowserExtension()) {
  // Safe to use chrome.runtime APIs
  chrome.runtime.sendMessage({ action: 'wallet-connected' });
}
```
