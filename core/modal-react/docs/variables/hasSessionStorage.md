[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / hasSessionStorage

# Variable: hasSessionStorage()

> `const` **hasSessionStorage**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:100

Check if sessionStorage is available

## Returns

`boolean`

True if sessionStorage is available and working

## Remarks

Similar to hasLocalStorage, this function tests sessionStorage functionality
by attempting to write and remove a test key. Session storage persists only for the
duration of the page session

## Example

```typescript
if (hasSessionStorage()) {
  sessionStorage.setItem('temp-data', JSON.stringify(data));
}
```
