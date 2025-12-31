[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / hasIndexedDB

# Variable: hasIndexedDB()

> `const` **hasIndexedDB**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:133

Check if IndexedDB is available

## Returns

`boolean`

True if IndexedDB is supported

## Remarks

IndexedDB is a low-level API for client-side storage of significant amounts
of structured data. This function checks for its availability

## Example

```typescript
if (hasIndexedDB()) {
  const request = indexedDB.open('MyDatabase', 1);
  request.onsuccess = () => {
    const db = request.result;
    // Use the database
  };
}
```
