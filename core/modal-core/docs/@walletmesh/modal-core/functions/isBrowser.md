[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isBrowser

# Function: isBrowser()

> **isBrowser**(): `boolean`

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
