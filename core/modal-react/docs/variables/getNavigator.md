[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / getNavigator

# Variable: getNavigator()

> `const` **getNavigator**: () => `Navigator` \| `undefined`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:213

Safe navigator getter that returns undefined on server

## Returns

`Navigator` \| `undefined`

Navigator object or undefined if not in browser

## Remarks

Use this function when you need to access the navigator object in code that
might run on the server. Useful for feature detection and browser capabilities

## Example

```typescript
const nav = getNavigator();
if (nav && nav.geolocation) {
  nav.geolocation.getCurrentPosition(position => {
    console.log('User location:', position);
  });
}
```
