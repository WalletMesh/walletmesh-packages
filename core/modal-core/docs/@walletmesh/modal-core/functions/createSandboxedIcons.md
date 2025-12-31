[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createSandboxedIcons

# Function: createSandboxedIcons()

> **createSandboxedIcons**(`icons`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`HTMLIFrameElement`[]\>

Creates multiple sandboxed icons efficiently

## Parameters

### icons

[`CreateSandboxedIconOptions`](../interfaces/CreateSandboxedIconOptions.md)[]

Array of icon configurations

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`HTMLIFrameElement`[]\>

Promise<Array<HTMLIFrameElement>> instances

## Example

```typescript
const iframes = await createSandboxedIcons([
  { iconDataUri: 'data:image/svg+xml,...', size: 24 },
  { iconDataUri: 'data:image/svg+xml,...', size: 32 }
]);
```
