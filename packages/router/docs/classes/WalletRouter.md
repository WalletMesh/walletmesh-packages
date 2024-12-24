[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / WalletRouter

# Class: WalletRouter

Multi-chain router for managing wallet connections.
Routes JSON-RPC requests to appropriate wallet instances based on chain ID.

The router manages wallet sessions and permissions through a single permission callback
that receives complete context about each operation.

**`Example`**

```typescript
const wallets = new Map([
  ['aztec:testnet', new JSONRPCClient(...)],
  ['eip155:1', new JSONRPCClient(...)]
]);

const router = new WalletRouter(
  async (response) => console.log(response),
  wallets,
  // Example permission callback
  async (context) => {
    // Allow everything in development
    return true;
  }
);
```

## Hierarchy

- `JSONRPCServer`\<[`RouterMethodMap`](../modules.md#routermethodmap), [`RouterContext`](../interfaces/RouterContext.md)\>

  ↳ **`WalletRouter`**

## Table of contents

### Constructors

- [constructor](WalletRouter.md#constructor)

### Properties

- [sessionStore](WalletRouter.md#sessionstore)

### Methods

- [\_call](WalletRouter.md#_call)
- [addMiddleware](WalletRouter.md#addmiddleware)
- [bulkCall](WalletRouter.md#bulkcall)
- [call](WalletRouter.md#call)
- [connect](WalletRouter.md#connect)
- [disconnect](WalletRouter.md#disconnect)
- [getPermissions](WalletRouter.md#getpermissions)
- [getSupportedMethods](WalletRouter.md#getsupportedmethods)
- [receiveRequest](WalletRouter.md#receiverequest)
- [reconnect](WalletRouter.md#reconnect)
- [registerMethod](WalletRouter.md#registermethod)
- [updatePermissions](WalletRouter.md#updatepermissions)
- [validateChain](WalletRouter.md#validatechain)
- [validateSession](WalletRouter.md#validatesession)

## Constructors

### constructor

• **new WalletRouter**(`sendResponse`, `wallets`, `permissionCallback`, `permissionApprovalCallback`, `sessionStore?`): [`WalletRouter`](WalletRouter.md)

Creates a new WalletRouter instance

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `sendResponse` | (`response`: `unknown`) => `Promise`\<`void`\> | `undefined` | Function to send JSON-RPC responses back to the client |
| `wallets` | [`Wallets`](../modules.md#wallets) | `undefined` | Map of chain IDs to their corresponding JSON-RPC client instances |
| `permissionCallback` | [`PermissionCallback`](../modules.md#permissioncallback) | `undefined` | Callback to check permissions for all operations |
| `permissionApprovalCallback` | [`PermissionApprovalCallback`](../modules.md#permissionapprovalcallback) | `undefined` | Callback to approve and return complete permission sets |
| `sessionStore` | [`SessionStore`](../interfaces/SessionStore.md) | `defaultStore` | - |

#### Returns

[`WalletRouter`](WalletRouter.md)

#### Overrides

JSONRPCServer\&lt;RouterMethodMap, RouterContext\&gt;.constructor

#### Defined in

[packages/router/src/router.ts:57](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L57)

## Properties

### sessionStore

• `Protected` **sessionStore**: [`SessionStore`](../interfaces/SessionStore.md)

#### Defined in

[packages/router/src/router.ts:45](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L45)

## Methods

### \_call

▸ **_call**(`client`, `methodCall`): `Promise`\<`unknown`\>

Internal helper to execute a method call on a wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `client` | [`WalletClient`](../interfaces/WalletClient.md) | JSON-RPC client instance for the wallet |
| `methodCall` | [`MethodCall`](../interfaces/MethodCall.md) | Method call details |

#### Returns

`Promise`\<`unknown`\>

Result from the wallet method call

**`Throws`**

If method is not supported or wallet is unavailable

#### Defined in

[packages/router/src/router.ts:331](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L331)

___

### addMiddleware

▸ **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the stack.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `middleware` | `JSONRPCMiddleware`\<[`RouterMethodMap`](../modules.md#routermethodmap), [`RouterContext`](../interfaces/RouterContext.md)\> | The middleware function to add. |

#### Returns

`fn`

A function to remove the middleware from the stack.

▸ (): `void`

##### Returns

`void`

#### Inherited from

JSONRPCServer.addMiddleware

#### Defined in

packages/jsonrpc/dist/server.d.ts:39

___

### bulkCall

▸ **bulkCall**(`_context`, `params`): `Promise`\<`unknown`[]\>

Handles wm_bulkCall method
Executes multiple method calls in sequence on the same chain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | [`BulkCallParams`](../interfaces/BulkCallParams.md) | Parameters including chain ID, session ID, and array of method calls |

#### Returns

`Promise`\<`unknown`[]\>

Array of results from the wallet method calls

**`Throws`**

If session is invalid, chain is unknown, permissions are insufficient,
                     or if there's a partial failure during execution

#### Defined in

[packages/router/src/router.ts:356](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L356)

___

### call

▸ **call**(`_context`, `params`): `Promise`\<`unknown`\>

Handles wm_call method
Routes method calls to the appropriate wallet instance after validating permissions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | [`CallParams`](../interfaces/CallParams.md) | Call parameters including chain ID, session ID, and method details |

#### Returns

`Promise`\<`unknown`\>

Result from the wallet method call

**`Throws`**

If session is invalid, chain is unknown, or permissions are insufficient

#### Defined in

[packages/router/src/router.ts:311](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L311)

___

### connect

▸ **connect**(`_context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `sessionId`: `string`  }\>

Handles wm_connect method
Creates a new session for the specified chain with requested permissions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | `Object` | Connection parameters including chain ID and permissions |
| `params.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) | - |

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `sessionId`: `string`  }\>

Object containing the new session ID

**`Throws`**

If chain ID is invalid

#### Defined in

[packages/router/src/router.ts:179](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L179)

___

### disconnect

▸ **disconnect**(`_context`, `params`): `Promise`\<`boolean`\>

Handles wm_disconnect method
Ends an existing session and removes it from the router

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | `Object` | Disconnect parameters including session ID |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<`boolean`\>

true if session was successfully ended

**`Throws`**

If session ID is invalid

#### Defined in

[packages/router/src/router.ts:220](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L220)

___

### getPermissions

▸ **getPermissions**(`_context`, `params`): `Promise`\<[`ChainPermissions`](../modules.md#chainpermissions)\>

Handles wm_getPermissions method
Returns the current permissions for an existing session

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | `Object` | Parameters including session ID |
| `params.chainIds?` | `string`[] | - |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<[`ChainPermissions`](../modules.md#chainpermissions)\>

Array of permitted method names

**`Throws`**

If session ID is invalid

#### Defined in

[packages/router/src/router.ts:244](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L244)

___

### getSupportedMethods

▸ **getSupportedMethods**(`_context`, `params`): `Promise`\<`Record`\<`string`, `string`[]\>\>

Handles wm_getSupportedMethods method
If chainIds is provided, queries the wallets for their supported methods
If no chainIds provided, returns the methods supported by the router itself

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | `Object` | Parameters including optional array of chain IDs |
| `params.chainIds?` | `string`[] | - |

#### Returns

`Promise`\<`Record`\<`string`, `string`[]\>\>

Record mapping chain IDs to their supported methods

**`Throws`**

If any chain is unknown or wallet is unavailable

#### Defined in

[packages/router/src/router.ts:397](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L397)

___

### receiveRequest

▸ **receiveRequest**(`context`, `request`): `Promise`\<`void`\>

Receives a JSON-RPC request and handles it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | [`RouterContext`](../interfaces/RouterContext.md) | - |
| `request` | `JSONRPCRequest`\<[`RouterMethodMap`](../modules.md#routermethodmap), keyof [`RouterMethodMap`](../modules.md#routermethodmap), `JSONRPCParams`\> | The JSON-RPC request object. |

#### Returns

`Promise`\<`void`\>

#### Inherited from

JSONRPCServer.receiveRequest

#### Defined in

packages/jsonrpc/dist/server.d.ts:45

___

### reconnect

▸ **reconnect**(`_context`, `params`): `Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `status`: `boolean`  }\>

Handles wm_reconnect method
Attempts to reconnect to an existing session

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context |
| `params` | `Object` | Parameters including session ID |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<\{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `status`: `boolean`  }\>

true if reconnection was successful, false if session doesn't exist or is expired

#### Defined in

[packages/router/src/router.ts:88](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L88)

___

### registerMethod

▸ **registerMethod**\<`M`\>(`name`, `handler`, `serializer?`): `void`

Registers a method that can be called remotely.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends keyof [`RouterMethodMap`](../modules.md#routermethodmap) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `M` | The method name. |
| `handler` | `MethodHandler`\<[`RouterMethodMap`](../modules.md#routermethodmap), `M`, [`RouterContext`](../interfaces/RouterContext.md)\> | The function to handle the method call. |
| `serializer?` | `JSONRPCSerializer`\<[`RouterMethodMap`](../modules.md#routermethodmap)[`M`][``"params"``], [`RouterMethodMap`](../modules.md#routermethodmap)[`M`][``"result"``]\> | Optional serializer for parameters and result. |

#### Returns

`void`

#### Inherited from

JSONRPCServer.registerMethod

#### Defined in

packages/jsonrpc/dist/server.d.ts:32

___

### updatePermissions

▸ **updatePermissions**(`_context`, `params`): `Promise`\<`boolean`\>

Handles wm_updatePermissions method
Updates the permissions for an existing session

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `_context` | [`RouterContext`](../interfaces/RouterContext.md) | Router context (unused) |
| `params` | `Object` | Parameters including session ID and new permissions |
| `params.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) | - |
| `params.sessionId` | `string` | - |

#### Returns

`Promise`\<`boolean`\>

true if permissions were successfully updated

**`Throws`**

If session ID is invalid

#### Defined in

[packages/router/src/router.ts:277](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L277)

___

### validateChain

▸ **validateChain**(`chainId`): [`WalletClient`](../interfaces/WalletClient.md)

Validates a chain ID and returns its corresponding JSON-RPC client

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chainId` | `string` | Chain ID to validate |

#### Returns

[`WalletClient`](../interfaces/WalletClient.md)

JSON-RPC client for the chain

**`Throws`**

If chain ID is unknown or not configured

#### Defined in

[packages/router/src/router.ts:163](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L163)

___

### validateSession

▸ **validateSession**(`operation`, `sessionId`, `chainId`, `method`, `params?`, `context?`): `Promise`\<[`SessionData`](../interfaces/SessionData.md)\>

Validates a session and its permissions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `operation` | [`OperationType`](../modules.md#operationtype) | Type of operation being performed |
| `sessionId` | `string` | ID of the session to validate |
| `chainId` | `string` | Chain ID for the request |
| `method` | `string` | Method being called |
| `params?` | `unknown` | Method parameters |
| `context?` | [`RouterContext`](../interfaces/RouterContext.md) | Router context containing origin |

#### Returns

`Promise`\<[`SessionData`](../interfaces/SessionData.md)\>

The validated session data

**`Throws`**

If session is invalid, expired, or has insufficient permissions

#### Defined in

[packages/router/src/router.ts:114](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/router.ts#L114)
