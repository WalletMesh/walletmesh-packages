[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / hasSessionStorage

# Function: hasSessionStorage()

> **hasSessionStorage**(): `boolean`

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
