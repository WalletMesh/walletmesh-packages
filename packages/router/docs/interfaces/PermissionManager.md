[**@walletmesh/router v0.2.2**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionManager

# Interface: PermissionManager\<T, C\>

Interface for implementing permission management strategies.
Handles all aspects of permission lifecycle including approval,
verification, retrieval, and cleanup.

## Example

```typescript
class MyPermissionManager implements PermissionManager {
  async approvePermissions(context, request) {
    // Custom permission approval logic
  }

  async checkPermissions(context, request) {
    // Custom permission verification logic
  }

  async getPermissions(context, chainIds) {
    // Custom permission retrieval logic
  }
}
```

## Type Parameters

• **T** *extends* [`RouterMethodMap`](RouterMethodMap.md)

Router method map type for type-safe method handling

• **C** *extends* [`RouterContext`](RouterContext.md)

Router context type for session and origin information

## Properties

### approvePermissions

> **approvePermissions**: [`PermissionApprovalCallback`](../type-aliases/PermissionApprovalCallback.md)\<`C`\>

Handle permission approval requests.
Called when new permissions are requested or existing ones are updated.

#### Defined in

[packages/router/src/types.ts:190](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L190)

***

### checkPermissions

> **checkPermissions**: [`PermissionCheckCallback`](../type-aliases/PermissionCheckCallback.md)\<`T`, `C`\>

Verify if a method call is permitted.
Called before each method invocation to enforce permissions.

#### Defined in

[packages/router/src/types.ts:196](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L196)

***

### cleanup?

> `optional` **cleanup**: [`PermissionCleanupCallback`](../type-aliases/PermissionCleanupCallback.md)\<`C`\>

Optional cleanup handler for when sessions end.
Used to clean up any permission state when sessions are terminated.

#### Defined in

[packages/router/src/types.ts:208](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L208)

***

### getPermissions

> **getPermissions**: [`PermissionGetCallback`](../type-aliases/PermissionGetCallback.md)\<`C`\>

Get current permissions in human-readable format.
Used for displaying current permission state to users.

#### Defined in

[packages/router/src/types.ts:202](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L202)
