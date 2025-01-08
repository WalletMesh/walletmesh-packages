[**@walletmesh/router v0.2.3**](../README.md)

***

[@walletmesh/router](../globals.md) / RouterMethodMap

# Interface: RouterMethodMap

Router method map following JSON-RPC spec.
Defines all available methods that can be called on the router,
their parameters, and return types.

## Extends

- `JSONRPCMethodMap`

## Indexable

 \[`method`: `string`\]: `JSONRPCMethodDef`

## Properties

### wm\_bulkCall

> **wm\_bulkCall**: `object`

Execute multiple method calls in sequence

#### params

> **params**: [`BulkCallParams`](BulkCallParams.md)

#### result

> **result**: `unknown`[]

#### Param

Chain to invoke the methods on

#### Param

Session ID for authorization

#### Param

Array of method calls to execute

#### Returns

Array of results corresponding to each method call

#### Defined in

[packages/router/src/types.ts:449](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L449)

***

### wm\_call

> **wm\_call**: `object`

Invoke a method on a specific chain

#### params

> **params**: [`CallParams`](CallParams.md)

#### result

> **result**: `unknown`

#### Param

Chain to invoke the method on

#### Param

Session ID for authorization

#### Param

Method call details including name and parameters

#### Returns

Result of the method call, type depends on the method called

#### Defined in

[packages/router/src/types.ts:437](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L437)

***

### wm\_connect

> **wm\_connect**: `object`

Create a new session with specified permissions

#### params

> **params**: `object`

##### params.permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### result

> **result**: `object`

##### result.permissions

> **permissions**: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)

##### result.sessionId

> **sessionId**: `string`

#### Param

Record of chain IDs to their requested method permissions

#### Returns

Object containing the new session ID and approved permissions

#### Defined in

[packages/router/src/types.ts:380](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L380)

***

### wm\_disconnect

> **wm\_disconnect**: `object`

End an existing session

#### params

> **params**: `object`

##### params.sessionId

> **sessionId**: `string`

#### result

> **result**: `boolean`

#### Param

ID of the session to end

#### Returns

true if session was successfully ended

#### Defined in

[packages/router/src/types.ts:395](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L395)

***

### wm\_getPermissions

> **wm\_getPermissions**: `object`

Get current session permissions

#### params

> **params**: `object`

##### params.chainIds?

> `optional` **chainIds**: `string`[]

##### params.sessionId

> **sessionId**: `string`

#### result

> **result**: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)

#### Param

ID of the session to get permissions for

#### Param

Optional array of chain IDs to filter permissions by

#### Returns

Current permissions in human-readable format

#### Defined in

[packages/router/src/types.ts:408](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L408)

***

### wm\_getSupportedMethods

> **wm\_getSupportedMethods**: `object`

Get supported methods for specified chains

#### params

> **params**: `object`

##### params.chainIds?

> `optional` **chainIds**: `string`[]

#### result

> **result**: `Record`\<`string`, `string`[]\>

#### Param

Optional array of chain IDs to get methods for

#### Returns

Record mapping chain IDs to their supported method names

#### Defined in

[packages/router/src/types.ts:459](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L459)

***

### wm\_reconnect

> **wm\_reconnect**: `object`

Attempt to reconnect to an existing session

#### params

> **params**: `object`

##### params.sessionId

> **sessionId**: `string`

#### result

> **result**: `object`

##### result.permissions

> **permissions**: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)

##### result.status

> **status**: `boolean`

#### Param

ID of the session to reconnect to

#### Returns

Object containing reconnection status and current permissions

#### Defined in

[packages/router/src/types.ts:365](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L365)

***

### wm\_updatePermissions

> **wm\_updatePermissions**: `object`

Update session permissions

#### params

> **params**: `object`

##### params.permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

##### params.sessionId

> **sessionId**: `string`

#### result

> **result**: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)

#### Param

ID of the session to update

#### Param

Record of chain IDs to their new requested permissions

#### Returns

Newly approved permissions in human-readable format

#### Defined in

[packages/router/src/types.ts:422](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L422)
