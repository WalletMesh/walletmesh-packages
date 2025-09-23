[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / hasWebWorkerSupport

# Variable: hasWebWorkerSupport()

> `const` **hasWebWorkerSupport**: () => `boolean`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:53

Check if Web Workers are available

## Returns

`boolean`

True if Web Workers are supported

## Remarks

Web Workers allow running JavaScript in background threads. This function
checks both that we're in a browser and that the Worker constructor is available

## Example

```typescript
if (hasWebWorkerSupport()) {
  const worker = new Worker('worker.js');
  worker.postMessage({ cmd: 'start' });
}
```
