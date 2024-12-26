[**@walletmesh/router v0.1.0**](../README.md)

***

[@walletmesh/router](../globals.md) / RouterMethodMap

# Interface: RouterMethodMap

Router method map following JSON-RPC spec
Defines all available methods that can be called on the router, their parameters and return types

## Extends

- `JSONRPCMethodMap`

## Indexable

 \[`method`: `string`\]: `JSONRPCMethodDef`\<`JSONRPCParams`, `unknown`\>

## Properties

### wm\_bulkCall

> **wm\_bulkCall**: `object`

#### params

> **params**: [`BulkCallParams`](BulkCallParams.md)

#### result

> **result**: `unknown`[]

#### Defined in

[packages/router/src/types.ts:328](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L328)

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

[packages/router/src/types.ts:323](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L323)

***

### wm\_connect

> **wm\_connect**: `object`

Create a new session

#### params

> **params**: `object`

##### params.permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### result

> **result**: `object`

##### result.permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

##### result.sessionId

> **sessionId**: `string`

#### Param

The chain to connect to

#### Param

Array of method names that the session requests permission to call

#### Returns

Object containing the new session ID

#### Defined in

[packages/router/src/types.ts:266](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L266)

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

[packages/router/src/types.ts:281](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L281)

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

> **result**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### Param

ID of the session to get permissions for

#### Param

Optional array of chain IDs to get permissions for. If not provided, returns permissions for all chains

#### Returns

Record of chain IDs to their permissions

#### Defined in

[packages/router/src/types.ts:294](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L294)

***

### wm\_getSupportedMethods

> **wm\_getSupportedMethods**: `object`

Get supported methods

#### params

> **params**: `object`

##### params.chainIds?

> `optional` **chainIds**: `string`[]

#### result

> **result**: `Record`\<`string`, `string`[]\>

#### Param

Optional chain to get methods for. If not provided, returns router's supported methods

#### Returns

Object containing array of supported method names

#### Defined in

[packages/router/src/types.ts:338](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L338)

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

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

##### result.status

> **status**: `boolean`

#### Param

ID of the session to reconnect to

#### Returns

true if reconnection was successful, false otherwise

#### Defined in

[packages/router/src/types.ts:250](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L250)

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

> **result**: `boolean`

#### Param

ID of the session to update

#### Param

Record of chain IDs to their new permissions

#### Returns

true if permissions were successfully updated

#### Defined in

[packages/router/src/types.ts:308](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L308)
