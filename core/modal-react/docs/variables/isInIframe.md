[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isInIframe

# Variable: isInIframe()

> `const` **isInIframe**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:149

Check if the page is in an iframe

## Returns

`boolean`

True if running inside an iframe

## Remarks

Detects if the current page is loaded inside an iframe by comparing window.self
to window.top. If they differ, we're in an iframe. Cross-origin iframes will throw an
error when accessing window.top, which we catch and interpret as being in an iframe

## Example

```typescript
if (isInIframe()) {
  console.log('Running inside an iframe');
  // May need to handle postMessage communication
}
```
