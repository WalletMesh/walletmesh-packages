[**@walletmesh/router v0.2.5**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionApprovalCallback

# Type Alias: PermissionApprovalCallback()\<C\>

> **PermissionApprovalCallback**\<`C`\>: (`context`, `permissionRequest`) => `Promise`\<[`HumanReadableChainPermissions`](HumanReadableChainPermissions.md)\>

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

## Defined in

[packages/router/src/types.ts:109](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L109)
