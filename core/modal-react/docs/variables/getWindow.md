[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / getWindow

# Variable: getWindow()

> `const` **getWindow**: () => `Window` \| `undefined`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:180

Safe window getter that returns undefined on server

## Returns

`Window` \| `undefined`

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
