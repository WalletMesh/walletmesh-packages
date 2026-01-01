[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getNavigator

# Function: getNavigator()

> **getNavigator**(): `undefined` \| `Navigator`

Safe navigator getter that returns undefined on server

## Returns

`undefined` \| `Navigator`

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
