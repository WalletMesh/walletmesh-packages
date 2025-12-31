[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / hasIndexedDB

# Function: hasIndexedDB()

> **hasIndexedDB**(): `boolean`

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
