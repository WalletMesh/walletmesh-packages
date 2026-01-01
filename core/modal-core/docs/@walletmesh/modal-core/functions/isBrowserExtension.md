[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isBrowserExtension

# Function: isBrowserExtension()

> **isBrowserExtension**(): `boolean`

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
