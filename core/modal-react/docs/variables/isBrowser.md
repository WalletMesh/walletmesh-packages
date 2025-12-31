[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isBrowser

# Variable: isBrowser()

> `const` **isBrowser**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:24

Check if code is running in browser environment

## Returns

`boolean`

True if running in browser with window, document and navigator defined

## Remarks

This function checks for the existence of window, document, and navigator objects
to ensure we're in a proper browser environment, not just a partial environment

## Example

```typescript
if (isBrowser()) {
  // Safe to use browser APIs
  window.addEventListener('click', handler);
}
```
