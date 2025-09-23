[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / getDocument

# Variable: getDocument()

> `const` **getDocument**: () => `Document` \| `undefined`

Defined in: core/modal-core/dist/api/utils/environment.d.ts:196

Safe document getter that returns undefined on server

## Returns

`Document` \| `undefined`

Document object or undefined if not in browser

## Remarks

Use this function when you need to access the document object in code that
might run on the server. Essential for SSR-compatible DOM manipulation

## Example

```typescript
const doc = getDocument();
if (doc) {
  const element = doc.createElement('div');
  doc.body.appendChild(element);
}
```
