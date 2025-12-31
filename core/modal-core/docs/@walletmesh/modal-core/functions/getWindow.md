[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getWindow

# Function: getWindow()

> **getWindow**(): `undefined` \| `Window`

Safe window getter that returns undefined on server

## Returns

`undefined` \| `Window`

Window object or undefined if not in browser

## Remarks

Use this function when you need to access the window object in code that
might run on the server. It prevents ReferenceError in SSR environments

## Example

```typescript
const win = getWindow();
if (win) {
  win.addEventListener('resize', handleResize);
}
```
