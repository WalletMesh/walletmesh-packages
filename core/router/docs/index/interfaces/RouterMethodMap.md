[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterMethodMap

# Interface: RouterMethodMap

Defined in: [core/router/src/types.ts:428](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L428)

Router method map following JSON-RPC spec.
Defines all available methods that can be called on the router,
their parameters, and return types.

## Extends

- `JSONRPCMethodMap`

## Indexable

\[`method`: `string`\]: `JSONRPCMethodDef`\<`JSONRPCParams`, `unknown`\>

## Properties

### aztec\_status

> **aztec\_status**: `object`

Defined in: [core/router/src/types.ts:434](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L434)

Aztec-specific status notifications (e.g., PXE readiness).

#### params

> **params**: `object`

##### Index Signature

\[`key`: `string`\]: `unknown`

##### params.pxeReady?

> `optional` **pxeReady**: `boolean`

##### params.timestamp?

> `optional` **timestamp**: `number`

#### result

> **result**: `undefined`

#### Param

Whether the PXE service is ready for requests

#### Param

Optional UNIX timestamp when status was emitted

***

### wm\_bulkCall

> **wm\_bulkCall**: [`WmBulkCallType`](WmBulkCallType.md)\<keyof `RouterMethodMap`\>

Defined in: [core/router/src/types.ts:545](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L545)

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

Defined in: [core/router/src/types.ts:528](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L528)

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

Defined in: [core/router/src/types.ts:463](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L463)

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

Defined in: [core/router/src/types.ts:478](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L478)

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

Defined in: [core/router/src/types.ts:491](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L491)

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

Defined in: [core/router/src/types.ts:552](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L552)

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

Defined in: [core/router/src/types.ts:448](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L448)

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

Defined in: [core/router/src/types.ts:505](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L505)

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
