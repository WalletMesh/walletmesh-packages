[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getDocument

# Function: getDocument()

> **getDocument**(): `undefined` \| `Document`

Safe document getter that returns undefined on server

## Returns

`undefined` \| `Document`

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
