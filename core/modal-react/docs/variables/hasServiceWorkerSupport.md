[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / hasServiceWorkerSupport

# Variable: hasServiceWorkerSupport()

> `const` **hasServiceWorkerSupport**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:68

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
