[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCWalletClient

# Class: JSONRPCWalletClient

Adapter class that wraps a JSONRPCClient to implement the WalletClient interface.
This adapter allows any JSON-RPC client to be used as a wallet client by
translating between the JSON-RPC protocol and the WalletClient interface.

**`Example`**

```typescript
const jsonRpcClient = new JSONRPCClient(...);
const walletClient = new JSONRPCWalletClient(jsonRpcClient);

// Use as a WalletClient
const accounts = await walletClient.call('eth_accounts');
```

## Implements

- [`WalletClient`](../interfaces/WalletClient.md)

## Table of contents

### Constructors

- [constructor](JSONRPCWalletClient.md#constructor)

### Methods

- [call](JSONRPCWalletClient.md#call)
- [getSupportedMethods](JSONRPCWalletClient.md#getsupportedmethods)

## Constructors

### constructor

• **new JSONRPCWalletClient**(`client`): [`JSONRPCWalletClient`](JSONRPCWalletClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `JSONRPCClient`\<[`WalletMethodMap`](../interfaces/WalletMethodMap.md)\> |

#### Returns

[`JSONRPCWalletClient`](JSONRPCWalletClient.md)

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:37](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/jsonrpc-adapter.ts#L37)

## Methods

### call

▸ **call**\<`T`\>(`method`, `params?`): `Promise`\<`T`\>

Calls a method on the underlying JSON-RPC client

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `string` | The method name to call |
| `params?` | `unknown` | Optional parameters to pass to the method |

#### Returns

`Promise`\<`T`\>

Promise resolving to the method result

**`Throws`**

If the method call fails or returns an error

**`Example`**

```typescript
// Call without parameters
const accounts = await client.call('eth_accounts');

// Call with parameters
const balance = await client.call('eth_getBalance', ['0x...', 'latest']);
```

#### Implementation of

[WalletClient](../interfaces/WalletClient.md).[call](../interfaces/WalletClient.md#call)

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:57](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/jsonrpc-adapter.ts#L57)

___

### getSupportedMethods

▸ **getSupportedMethods**(): `Promise`\<\{ `methods`: `string`[]  }\>

Gets the capabilities (supported methods) of the wallet

#### Returns

`Promise`\<\{ `methods`: `string`[]  }\>

Promise resolving to an object containing an array of supported method names

**`Throws`**

If the capabilities request fails

**`Example`**

```typescript
const { methods } = await client.getSupportedMethods();
console.log('Supported methods:', methods);
```

#### Implementation of

[WalletClient](../interfaces/WalletClient.md).[getSupportedMethods](../interfaces/WalletClient.md#getsupportedmethods)

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:78](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/jsonrpc-adapter.ts#L78)
