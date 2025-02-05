[**@walletmesh/aztec-rpc-wallet v0.3.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecChainWallet

# Class: AztecChainWallet

Defined in: [aztec/rpc-wallet/src/wallet.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/wallet.ts#L54)

JSON-RPC interface implementation for an Aztec Wallet.

This class provides the core wallet functionality exposed through JSON-RPC:
- Handles incoming RPC requests from dApps
- Manages wallet state and context
- Executes operations through the underlying Aztec wallet
- Serializes responses back to JSON-RPC format

The wallet supports operations like:
- Account management
- Transaction execution
- Contract interaction
- Note management
- Event logging

## Example

```typescript
// Create wallet instance
const wallet = new AztecChainWallet(aztecWallet, transport);

// Handle incoming RPC requests
transport.on('message', async (request) => {
  const response = await wallet.handleRequest(request);
  // Send response back to dApp
});
```

## Extends

- `JSONRPCNode`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md), [`AztecWalletEventMap`](../interfaces/AztecWalletEventMap.md), [`AztecWalletContext`](../type-aliases/AztecWalletContext.md)\>

## Constructors

### new AztecChainWallet()

> **new AztecChainWallet**(`pxe`, `wallet`, `transport`): [`AztecChainWallet`](AztecChainWallet.md)

Defined in: [aztec/rpc-wallet/src/wallet.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/wallet.ts#L71)

Creates a new AztecWallet instance.

#### Parameters

##### pxe

`PXE`

The PXE instance for the Aztec protocol

##### wallet

`AccountWallet`

The underlying Aztec wallet instance that executes operations

##### transport

`JSONRPCTransport`

Transport layer for sending/receiving JSON-RPC messages

The wallet instance sets up:
- Contract artifact caching
- Default request handlers
- Custom serialization for Aztec types

#### Returns

[`AztecChainWallet`](AztecChainWallet.md)

#### Overrides

`JSONRPCNode< AztecWalletMethodMap, AztecWalletEventMap, AztecWalletContext >.constructor`

## Properties

### context

> `readonly` **context**: [`AztecWalletContext`](../type-aliases/AztecWalletContext.md)

Defined in: core/jsonrpc/dist/node.d.ts:4

#### Inherited from

`JSONRPCNode.context`

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:19

#### Parameters

##### middleware

`JSONRPCMiddleware`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md), [`AztecWalletContext`](../type-aliases/AztecWalletContext.md)\>

#### Returns

`Function`

##### Returns

`void`

#### Inherited from

`JSONRPCNode.addMiddleware`

***

### asWalletRouterClient()

> **asWalletRouterClient**(): [`AztecWalletRouterClient`](../type-aliases/AztecWalletRouterClient.md)

Defined in: [aztec/rpc-wallet/src/wallet.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/aztec/rpc-wallet/src/wallet.ts#L91)

Creates a client wrapper for use with WalletMesh router.
This enables the wallet to be used as a client in a routing setup.

#### Returns

[`AztecWalletRouterClient`](../type-aliases/AztecWalletRouterClient.md)

Client interface for the wallet

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params`?, `timeoutInSeconds`?): `Promise`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: core/jsonrpc/dist/node.d.ts:15

#### Type Parameters

• **M** *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

#### Parameters

##### method

`M`

##### params?

[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"params"`\]

##### timeoutInSeconds?

`number`

#### Returns

`Promise`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Inherited from

`JSONRPCNode.callMethod`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:25

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.close`

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:18

#### Type Parameters

• **K** *extends* `string` \| `number`

#### Parameters

##### event

`K`

##### params

[`AztecWalletEventMap`](../interfaces/AztecWalletEventMap.md)\[`K`\]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.emit`

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:16

#### Type Parameters

• **M** *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

#### Parameters

##### method

`M`

##### params

[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"params"`\]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.notify`

***

### on()

> **on**\<`K`\>(`event`, `handler`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:17

#### Type Parameters

• **K** *extends* `string` \| `number`

#### Parameters

##### event

`K`

##### handler

(`params`) => `void`

#### Returns

`Function`

##### Returns

`void`

#### Inherited from

`JSONRPCNode.on`

***

### receiveMessage()

> **receiveMessage**(`message`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:20

#### Parameters

##### message

`unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.receiveMessage`

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:13

#### Type Parameters

• **M** *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

#### Parameters

##### name

`Extract`\<`M`, `string`\>

##### handler

(`context`, `params`) => `Promise`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.registerMethod`

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:14

#### Type Parameters

• **M** *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

#### Parameters

##### method

`M`

##### serializer

`JSONRPCSerializer`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"params"`\], [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.registerSerializer`

***

### setFallbackHandler()

> **setFallbackHandler**(`handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:24

#### Parameters

##### handler

(`context`, `method`, `params`) => `Promise`\<`unknown`\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.setFallbackHandler`

***

### setFallbackSerializer()

> **setFallbackSerializer**(`serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:11

#### Parameters

##### serializer

`JSONRPCSerializer`\<`unknown`, `unknown`\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.setFallbackSerializer`
