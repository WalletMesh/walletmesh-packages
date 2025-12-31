[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / hasLocalStorage

# Variable: hasLocalStorage()

> `const` **hasLocalStorage**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:85

Check if localStorage is available

## Returns

`boolean`

True if localStorage is available and working

## Remarks

This function not only checks for localStorage existence but also tests if it's
functional by attempting to write and remove a test key. Some browsers in private mode
have localStorage defined but throw errors when trying to use it

## Example

```typescript
if (hasLocalStorage()) {
  localStorage.setItem('user-preference', 'dark-mode');
} else {
  // Fall back to in-memory storage
}
```
