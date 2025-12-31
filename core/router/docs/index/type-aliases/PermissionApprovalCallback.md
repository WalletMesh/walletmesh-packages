[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionApprovalCallback

# Type Alias: PermissionApprovalCallback()\<C\>

> **PermissionApprovalCallback**\<`C`\> = (`context`, `permissionRequest`) => `Promise`\<[`HumanReadableChainPermissions`](HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/types.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L82)

Callback for handling permission approval requests.
Called when a client requests new permissions or updates existing ones.

## Type Parameters

### C

`C` *extends* [`RouterContext`](../interfaces/RouterContext.md)

## Parameters

### context

`C`

Router context containing session and origin information

### permissionRequest

[`ChainPermissions`](ChainPermissions.md)

Requested permissions per chain

## Returns

`Promise`\<[`HumanReadableChainPermissions`](HumanReadableChainPermissions.md)\>

Promise resolving to approved permissions in human-readable format

## Example

```typescript
const approvalCallback: PermissionApprovalCallback = async (context, request) => {
  const approved = await showPermissionDialog(request);
  return approved ? request : {};
};
```
