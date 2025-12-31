[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / hasServiceWorkerSupport

# Function: hasServiceWorkerSupport()

> **hasServiceWorkerSupport**(): `boolean`

Check if Service Workers are available

## Returns

`boolean`

True if Service Workers are supported

## Remarks

Service Workers enable powerful features like offline functionality and push notifications.
This checks for the serviceWorker property on the navigator object

## Example

```typescript
if (hasServiceWorkerSupport()) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered:', registration));
}
```
