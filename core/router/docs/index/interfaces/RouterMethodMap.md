[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterMethodMap

# Interface: RouterMethodMap

Defined in: [core/router/src/types.ts:414](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L414)

Router method map following JSON-RPC spec.
Defines all available methods that can be called on the router,
their parameters, and return types.

## Extends

- `JSONRPCMethodMap`

## Indexable

\[`method`: `string`\]: `JSONRPCMethodDef`\<`JSONRPCParams`, `unknown`\>

## Properties

### wm\_bulkCall

> **wm\_bulkCall**: [`WmBulkCallType`](WmBulkCallType.md)\<keyof `RouterMethodMap`\>

Defined in: [core/router/src/types.ts:517](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L517)

Execute multiple method calls in sequence

#### Param

Chain to invoke the methods on

#### Param

Session ID for authorization

#### Param

Array of method calls to execute

#### Returns

Array of results corresponding to each method call

#### Example

```typescript
// Returns [string, string] (hex values)
const [balance, code] = await provider.bulkCall('eip155:1', [
  { method: 'eth_getBalance', params: ['0x...'] },
  { method: 'eth_getCode', params: ['0x...'] }
]);
```

***

### wm\_call

> **wm\_call**: [`WmCallType`](WmCallType.md)\<keyof `RouterMethodMap`\>

Defined in: [core/router/src/types.ts:500](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L500)

Invoke a method on a specific chain

#### Param

Chain to invoke the method on

#### Param

Session ID for authorization

#### Param

Method call details including name and parameters

#### Returns

Result of the method call, type depends on the method called

#### Example

```typescript
// Returns string (hex)
const balance = await provider.call('eip155:1', {
  method: 'eth_getBalance',
  params: ['0x...']
});
```

***

### wm\_connect

> **wm\_connect**: `object`

Defined in: [core/router/src/types.ts:435](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L435)

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

***

### wm\_disconnect

> **wm\_disconnect**: `object`

Defined in: [core/router/src/types.ts:450](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L450)

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

***

### wm\_getPermissions

> **wm\_getPermissions**: `object`

Defined in: [core/router/src/types.ts:463](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L463)

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

***

### wm\_getSupportedMethods

> **wm\_getSupportedMethods**: `object`

Defined in: [core/router/src/types.ts:524](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L524)

Get supported methods for specified chains

#### params

> **params**: `object`

##### params.chainIds?

> `optional` **chainIds**: `string`[]

#### result

> **result**: `Record`\<[`ChainId`](../type-aliases/ChainId.md), `string`[]\>

#### Param

Optional array of chain IDs to get methods for

#### Returns

Record mapping chain IDs to their supported method names

***

### wm\_reconnect

> **wm\_reconnect**: `object`

Defined in: [core/router/src/types.ts:420](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L420)

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

***

### wm\_updatePermissions

> **wm\_updatePermissions**: `object`

Defined in: [core/router/src/types.ts:477](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/types.ts#L477)

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
