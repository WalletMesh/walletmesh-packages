[@walletmesh/router - v0.1.0](../README.md) / [Exports](../modules.md) / RouterMethodMap

# Interface: RouterMethodMap

Router method map following JSON-RPC spec
Defines all available methods that can be called on the router, their parameters and return types

## Hierarchy

- `JSONRPCMethodMap`

  ↳ **`RouterMethodMap`**

## Table of contents

### Properties

- [wm\_bulkCall](RouterMethodMap.md#wm_bulkcall)
- [wm\_call](RouterMethodMap.md#wm_call)
- [wm\_connect](RouterMethodMap.md#wm_connect)
- [wm\_disconnect](RouterMethodMap.md#wm_disconnect)
- [wm\_getPermissions](RouterMethodMap.md#wm_getpermissions)
- [wm\_getSupportedMethods](RouterMethodMap.md#wm_getsupportedmethods)
- [wm\_reconnect](RouterMethodMap.md#wm_reconnect)
- [wm\_updatePermissions](RouterMethodMap.md#wm_updatepermissions)

## Properties

### wm\_bulkCall

• **wm\_bulkCall**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | [`BulkCallParams`](BulkCallParams.md) |
| `result` | `unknown`[] |

#### Defined in

[packages/router/src/types.ts:328](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L328)

___

### wm\_call

• **wm\_call**: `Object`

Invoke a method on a specific chain

**`Param`**

Chain to invoke the method on

**`Param`**

Session ID for authorization

**`Param`**

Method call details including name and parameters

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | [`CallParams`](CallParams.md) |
| `result` | `unknown` |

#### Defined in

[packages/router/src/types.ts:323](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L323)

___

### wm\_connect

• **wm\_connect**: `Object`

Create a new session

**`Param`**

The chain to connect to

**`Param`**

Array of method names that the session requests permission to call

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | \{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions)  } |
| `params.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) |
| `result` | \{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `sessionId`: `string`  } |
| `result.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) |
| `result.sessionId` | `string` |

#### Defined in

[packages/router/src/types.ts:266](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L266)

___

### wm\_disconnect

• **wm\_disconnect**: `Object`

End an existing session

**`Param`**

ID of the session to end

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | \{ `sessionId`: `string`  } |
| `params.sessionId` | `string` |
| `result` | `boolean` |

#### Defined in

[packages/router/src/types.ts:281](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L281)

___

### wm\_getPermissions

• **wm\_getPermissions**: `Object`

Get current session permissions

**`Param`**

ID of the session to get permissions for

**`Param`**

Optional array of chain IDs to get permissions for. If not provided, returns permissions for all chains

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | \{ `chainIds?`: `string`[] ; `sessionId`: `string`  } |
| `params.chainIds?` | `string`[] |
| `params.sessionId` | `string` |
| `result` | [`ChainPermissions`](../modules.md#chainpermissions) |

#### Defined in

[packages/router/src/types.ts:294](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L294)

___

### wm\_getSupportedMethods

• **wm\_getSupportedMethods**: `Object`

Get supported methods

**`Param`**

Optional chain to get methods for. If not provided, returns router's supported methods

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | \{ `chainIds?`: `string`[]  } |
| `params.chainIds?` | `string`[] |
| `result` | `Record`\<`string`, `string`[]\> |

#### Defined in

[packages/router/src/types.ts:338](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L338)

___

### wm\_reconnect

• **wm\_reconnect**: `Object`

Attempt to reconnect to an existing session

**`Param`**

ID of the session to reconnect to

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | \{ `sessionId`: `string`  } |
| `params.sessionId` | `string` |
| `result` | \{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `status`: `boolean`  } |
| `result.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) |
| `result.status` | `boolean` |

#### Defined in

[packages/router/src/types.ts:250](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L250)

___

### wm\_updatePermissions

• **wm\_updatePermissions**: `Object`

Update session permissions

**`Param`**

ID of the session to update

**`Param`**

Record of chain IDs to their new permissions

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | \{ `permissions`: [`ChainPermissions`](../modules.md#chainpermissions) ; `sessionId`: `string`  } |
| `params.permissions` | [`ChainPermissions`](../modules.md#chainpermissions) |
| `params.sessionId` | `string` |
| `result` | `boolean` |

#### Defined in

[packages/router/src/types.ts:308](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L308)
