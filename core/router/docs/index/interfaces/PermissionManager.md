[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionManager

# Interface: PermissionManager\<T, C\>

Defined in: [core/router/src/types.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L158)

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

### T

`T` *extends* [`RouterMethodMap`](RouterMethodMap.md)

Router method map type for type-safe method handling

### C

`C` *extends* [`RouterContext`](RouterContext.md)

Router context type for session and origin information

## Properties

### approvePermissions

> **approvePermissions**: [`PermissionApprovalCallback`](../type-aliases/PermissionApprovalCallback.md)\<`C`\>

Defined in: [core/router/src/types.ts:163](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L163)

Handle permission approval requests.
Called when new permissions are requested or existing ones are updated.

***

### checkPermissions

> **checkPermissions**: [`PermissionCheckCallback`](../type-aliases/PermissionCheckCallback.md)\<`T`, `C`\>

Defined in: [core/router/src/types.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L169)

Verify if a method call is permitted.
Called before each method invocation to enforce permissions.

***

### cleanup?

> `optional` **cleanup**: [`PermissionCleanupCallback`](../type-aliases/PermissionCleanupCallback.md)\<`C`\>

Defined in: [core/router/src/types.ts:181](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L181)

Optional cleanup handler for when sessions end.
Used to clean up any permission state when sessions are terminated.

***

### getPermissions

> **getPermissions**: [`PermissionGetCallback`](../type-aliases/PermissionGetCallback.md)\<`C`\>

Defined in: [core/router/src/types.ts:175](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L175)

Get current permissions in human-readable format.
Used for displaying current permission state to users.
