[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionApprovalCallback

# Type Alias: PermissionApprovalCallback()\<C\>

> **PermissionApprovalCallback**\<`C`\>: (`context`, `permissionRequest`) => `Promise`\<[`HumanReadableChainPermissions`](HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/types.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L109)

Callback for handling permission approval requests.
Called when a client requests new permissions or updates existing ones.

## Type Parameters

• **C** *extends* [`RouterContext`](../interfaces/RouterContext.md)

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
