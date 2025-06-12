[**@walletmesh/router v0.5.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [permissions](../README.md) / PermissivePermissionsManager

# Class: PermissivePermissionsManager\<T, C\>

Defined in: [core/router/src/permissions/permissive.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/permissions/permissive.ts#L50)

A permissive implementation of the PermissionManager interface that allows all operations.
This implementation is designed for:
- Development environments where quick iteration is prioritized
- Testing scenarios where permission checks would add complexity
- Trusted contexts where permission enforcement is not required
- Prototyping before implementing proper permission controls

Features:
- Zero-configuration setup
- All operations automatically permitted
- Wildcard chain and method matching
- No user interaction required
- Consistent permissive behavior

Security Note:
This implementation provides NO security guarantees and should NOT be used in production
environments where access control is required.

## Example

```typescript
// Create a permissive manager for development
const devPermissions = new PermissivePermissionsManager();

// All permission checks pass automatically
const allowed = await devPermissions.checkPermissions(context, {
  method: 'eth_sendTransaction',
  params: [...]
}); // Returns true

// All chains and methods are permitted
const permissions = await devPermissions.getPermissions();
// Returns: { '*': { '*': { allowed: true, shortDescription: 'Permissive' } } }
```

## See

 - [PermissionManager](../../index/interfaces/PermissionManager.md) for interface definition
 - [AllowAskDenyManager](AllowAskDenyManager.md) for production-ready implementation

## Type Parameters

### T

`T` *extends* [`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md) = [`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md)

Router method map type for type-safe method handling

### C

`C` *extends* [`RouterContext`](../../index/interfaces/RouterContext.md) = [`RouterContext`](../../index/interfaces/RouterContext.md)

Router context type for session and origin information

## Implements

- [`PermissionManager`](../../index/interfaces/PermissionManager.md)\<`T`, `C`\>

## Constructors

### Constructor

> **new PermissivePermissionsManager**\<`T`, `C`\>(): `PermissivePermissionsManager`\<`T`, `C`\>

#### Returns

`PermissivePermissionsManager`\<`T`, `C`\>

## Methods

### approvePermissions()

> **approvePermissions**(`_context`, `_PermissionRequest`): `Promise`\<[`HumanReadableChainPermissions`](../../index/type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/permissions/permissive.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/permissions/permissive.ts#L116)

Handle permission approval requests.
Called when new permissions are requested or existing ones are updated.

#### Parameters

##### \_context

`C`

Router context (unused in permissive implementation)

##### \_PermissionRequest

[`ChainPermissions`](../../index/type-aliases/ChainPermissions.md)

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../../index/type-aliases/HumanReadableChainPermissions.md)\>

Promise resolving to the permissive permissions configuration

#### See

 - [HumanReadableChainPermissions](../../index/type-aliases/HumanReadableChainPermissions.md) for return type structure
 - [ChainPermissions](../../index/type-aliases/ChainPermissions.md) for permission request structure

#### Implementation of

`PermissionManager.approvePermissions`

***

### checkPermissions()

> **checkPermissions**(`_context`, `_request`): `Promise`\<`boolean`\>

Defined in: [core/router/src/permissions/permissive.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/permissions/permissive.ts#L101)

Verify if a method call is permitted.
Called before each method invocation to enforce permissions.

#### Parameters

##### \_context

`C`

Router context (unused in permissive implementation)

##### \_request

`unknown`

JSON-RPC request (unused in permissive implementation)

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true for all requests

#### See

[RouterMethodMap](../../index/interfaces/RouterMethodMap.md) for supported method types

#### Implementation of

`PermissionManager.checkPermissions`

***

### getPermissions()

> **getPermissions**(): `Promise`\<[`HumanReadableChainPermissions`](../../index/type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/permissions/permissive.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/permissions/permissive.ts#L87)

Get current permissions in human-readable format.
Used for displaying current permission state to users.

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../../index/type-aliases/HumanReadableChainPermissions.md)\>

Promise resolving to the permissive permissions configuration

#### See

[HumanReadableChainPermissions](../../index/type-aliases/HumanReadableChainPermissions.md) for return type structure

#### Implementation of

`PermissionManager.getPermissions`
