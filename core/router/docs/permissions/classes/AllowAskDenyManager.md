[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [permissions](../README.md) / AllowAskDenyManager

# Class: AllowAskDenyManager\<T, C\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:117](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L117)

Implementation of the PermissionManager interface using a three-state model.
Manages permissions using ALLOW/DENY/ASK states with interactive prompts
for methods in the ASK state.

Permission States:
- ALLOW: Method calls are automatically permitted without prompting
- DENY: Method calls are automatically rejected without prompting
- ASK: User is prompted via askCallback to approve/deny each call

Features:
- Granular per-method permission control
- Chain-specific permission management
- Interactive permission prompts
- Bulk operation support with all-or-nothing semantics
- Human-readable permission descriptions

## Example

```typescript
// Initialize with custom prompt handling
const manager = new AllowAskDenyManager(
  // Approval callback for new permission requests
  async (context, request) => {
    const approved = await showPermissionDialog(request);
    return approved ? request : {};
  },
  // Ask callback for methods in ASK state
  async (context, request) => {
    return await showMethodPrompt(request.method);
  },
  // Initial permission states
  new Map([
    ['eip155:1', new Map([
      ['eth_sendTransaction', AllowAskDenyState.ASK],
      ['eth_accounts', AllowAskDenyState.ALLOW],
      ['personal_sign', AllowAskDenyState.DENY]
    ])]
  ])
);
```

## See

 - [PermissionManager](../../index/interfaces/PermissionManager.md) for interface definition
 - [AllowAskDenyState](../enumerations/AllowAskDenyState.md) for permission state definitions

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

> **new AllowAskDenyManager**\<`T`, `C`\>(`approvePermissionsCallback`, `askCallback`, `initialState`): `AllowAskDenyManager`\<`T`, `C`\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:135](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L135)

Creates a new AllowAskDenyManager instance.

#### Parameters

##### approvePermissionsCallback

[`PermissionApprovalCallback`](../../index/type-aliases/PermissionApprovalCallback.md)\<`C`\>

Callback for handling new permission requests

##### askCallback

[`AskCallback`](../type-aliases/AskCallback.md)\<`T`, `C`\>

Callback for prompting user about methods in ASK state

##### initialState

[`AllowAskDenyChainPermissions`](../type-aliases/AllowAskDenyChainPermissions.md)\<`T`\> = `...`

Initial permission states for chains and methods

#### Returns

`AllowAskDenyManager`\<`T`, `C`\>

#### Throws

If required callbacks are not provided

## Properties

### approvePermissions

> **approvePermissions**: [`PermissionApprovalCallback`](../../index/type-aliases/PermissionApprovalCallback.md)\<`C`\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L123)

Handle permission approval requests.
Called when new permissions are requested or existing ones are updated.

#### Implementation of

[`PermissionManager`](../../index/interfaces/PermissionManager.md).[`approvePermissions`](../../index/interfaces/PermissionManager.md#approvepermissions)

***

### askPermissions

> **askPermissions**: [`AskCallback`](../type-aliases/AskCallback.md)\<`T`, `C`\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:124](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L124)

## Methods

### checkBulkCallPermissions()

> **checkBulkCallPermissions**(`context`, `request`): `Promise`\<`boolean`\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:259](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L259)

Check permissions for a bulk method call request.
All methods in the bulk call must be permitted for the call to be allowed.

Permission checking logic:
1. If any method is explicitly DENY, the entire call is denied
2. If any method is ASK or undefined, user is prompted
3. If all methods are ALLOW, the call is allowed

This implements an all-or-nothing approach where either all methods
are permitted or none are. This ensures atomic operations where
partial execution is not desirable.

#### Parameters

##### context

`C`

Router context containing session and origin information

##### request

`JSONRPCRequest`\<[`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md), `"wm_bulkCall"`, \{ `calls`: [`MethodCall`](../../index/interfaces/MethodCall.md)\<keyof [`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md)\>[]; `chainId`: `string`; `sessionId`: `string`; \}\>

The bulk call JSON-RPC request

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if all method calls are permitted

#### Throws

If request is malformed or missing required parameters

#### Throws

If context is missing required session or origin information

#### Throws

If chainId is invalid or not provided

#### See

[\['wm\_bulkCall'\]](../../index/interfaces/RouterMethodMap.md) for request parameter details

***

### checkCallPermissions()

> **checkCallPermissions**(`context`, `request`): `Promise`\<`boolean`\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:316](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L316)

Check permissions for a single method call request.
The method's permission state determines the outcome:
- ALLOW: Returns true without prompting
- DENY: Returns false without prompting
- ASK: Prompts user via askCallback for decision
- undefined: Treated as ASK state

#### Parameters

##### context

`C`

Router context containing session and origin information

##### request

`JSONRPCRequest`\<[`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md), `"wm_call"`, \{ `call`: [`MethodCall`](../../index/interfaces/MethodCall.md)\<keyof [`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md)\>; `chainId`: `string`; `sessionId`: `string`; \}\>

The method call JSON-RPC request

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if the method call is permitted

#### Throws

If request is malformed or missing required parameters

#### Throws

If context is missing required session or origin information

#### Throws

If chainId is invalid or not provided

#### Throws

If askCallback is not provided for ASK state

#### See

 - [\['wm\_call'\]](../../index/interfaces/RouterMethodMap.md) for request parameter details
 - [AllowAskDenyState](../enumerations/AllowAskDenyState.md) for permission state definitions

***

### checkPermissions()

> **checkPermissions**\<`M`\>(`context`, `request`): `Promise`\<`boolean`\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L215)

Check if a method call is permitted based on its current permission state.
Routes permission checks to appropriate handler based on method type.

Permission Check Flow:
1. For wm_call: Routes to checkCallPermissions
2. For wm_bulkCall: Routes to checkBulkCallPermissions
3. For other methods: Returns true (router methods are always allowed)

#### Type Parameters

##### M

`M` *extends* `string` \| `number` \| `symbol`

Method name type from the router method map

#### Parameters

##### context

`C`

Router context containing session and origin information

##### request

`JSONRPCRequest`\<`T`, `M`, `T`\[`M`\]\[`"params"`\]\>

The JSON-RPC request being checked

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if the method call is permitted

#### Throws

If request is malformed or missing required parameters

#### Throws

If context is missing required session or origin information

#### See

 - [checkCallPermissions](#checkcallpermissions) for single method permission logic
 - [checkBulkCallPermissions](#checkbulkcallpermissions) for bulk operation permission logic

#### Implementation of

`PermissionManager.checkPermissions`

***

### getPermissions()

> **getPermissions**(`context`, `chainIds?`): `Promise`\<[`HumanReadableChainPermissions`](../../index/type-aliases/HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/permissions/allowAskDeny.ts#L158)

Gets current permissions in a human-readable format.
Converts internal permission states to a format suitable for display.

#### Parameters

##### context

`C`

Router context containing session and origin information

##### chainIds?

`string`[]

Optional array of chain IDs to filter permissions by

#### Returns

`Promise`\<[`HumanReadableChainPermissions`](../../index/type-aliases/HumanReadableChainPermissions.md)\>

Promise resolving to permissions in human-readable format:
         - allowed: Whether the method is currently allowed
         - shortDescription: String representation of the permission state

#### Throws

If context is missing required session or origin information

#### See

[HumanReadableChainPermissions](../../index/type-aliases/HumanReadableChainPermissions.md) for return type details

#### Implementation of

`PermissionManager.getPermissions`
