[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createSandboxedIcons

# Function: createSandboxedIcons()

> **createSandboxedIcons**(`icons`): `Promise`\<`HTMLIFrameElement`[]\>

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:96

Creates multiple sandboxed icons efficiently

## Parameters

### icons

[`CreateSandboxedIconOptions`](../interfaces/CreateSandboxedIconOptions.md)[]

Array of icon configurations

## Returns

`Promise`\<`HTMLIFrameElement`[]\>

Promise<Array<HTMLIFrameElement>> instances

## Example

```typescript
const iframes = await createSandboxedIcons([
  { iconDataUri: 'data:image/svg+xml,...', size: 24 },
  { iconDataUri: 'data:image/svg+xml,...', size: 32 }
]);
```
