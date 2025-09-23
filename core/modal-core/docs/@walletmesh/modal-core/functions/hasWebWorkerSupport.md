[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / hasWebWorkerSupport

# Function: hasWebWorkerSupport()

> **hasWebWorkerSupport**(): `boolean`

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
