[**@walletmesh/aztec-rpc-wallet v0.3.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecChainProvider

# Class: AztecChainProvider

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L11)

Provider for directly interacting with an Aztec chain wallet.
This is a minimal implementation that supports core Aztec operations
without the complexity of multi-chain routing.

## Extends

- `JSONRPCNode`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\>

## Constructors

### Constructor

> **new AztecChainProvider**(`transport`, `context?`): `AztecChainProvider`

Defined in: core/jsonrpc/dist/node.d.ts:12

#### Parameters

##### transport

[`JSONRPCTransport`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCTransport.md)

##### context?

`JSONRPCContext`

#### Returns

`AztecChainProvider`

#### Inherited from

`JSONRPCNode<AztecWalletMethodMap>.constructor`

## Properties

### context

> `readonly` **context**: `JSONRPCContext`

Defined in: core/jsonrpc/dist/node.d.ts:4

#### Inherited from

`JSONRPCNode.context`

## Methods

### addMiddleware()

> **addMiddleware**(`middleware`): () => `void`

Defined in: core/jsonrpc/dist/node.d.ts:19

#### Parameters

##### middleware

[`JSONRPCMiddleware`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/type-aliases/JSONRPCMiddleware.md)\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md), `JSONRPCContext`\>

#### Returns

> (): `void`

##### Returns

`void`

#### Inherited from

`JSONRPCNode.addMiddleware`

***

### callMethod()

> **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: core/jsonrpc/dist/node.d.ts:15

#### Type Parameters

##### M

`M` *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

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

### connect()

> **connect**(): `Promise`\<`boolean`\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L26)

#### Returns

`Promise`\<`boolean`\>

***

### emit()

> **emit**\<`K`\>(`event`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:18

#### Type Parameters

##### K

`K` *extends* `string` \| `number`

#### Parameters

##### event

`K`

##### params

[`JSONRPCEventMap`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCEventMap.md)\[`K`\]

#### Returns

`Promise`\<`void`\>

#### Inherited from

`JSONRPCNode.emit`

***

### getAccount()

> **getAccount**(): `Promise`\<`string`\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L40)

Gets the account address from the wallet.

#### Returns

`Promise`\<`string`\>

The account address as a string

#### Throws

If response is invalid

***

### makeRequest()

> `protected` **makeRequest**\<`M`\>(`method`, `params?`): `Promise`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:12](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L12)

#### Type Parameters

##### M

`M` *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

#### Parameters

##### method

`M`

##### params?

[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"params"`\]

#### Returns

`Promise`\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

***

### notify()

> **notify**\<`M`\>(`method`, `params`): `Promise`\<`void`\>

Defined in: core/jsonrpc/dist/node.d.ts:16

#### Type Parameters

##### M

`M` *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

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

##### K

`K` *extends* `string` \| `number`

#### Parameters

##### event

`K`

##### handler

(`params`) => `void`

#### Returns

> (): `void`

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

### registerContract()

> **registerContract**(`params`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L81)

Registers a contract instance with the wallet.

#### Parameters

##### params

Contract registration parameters

###### artifact?

`ContractArtifact`

###### instance

`ContractInstanceWithAddress`

#### Returns

`Promise`\<`void`\>

#### Throws

If registration fails

***

### registerContractClass()

> **registerContractClass**(`params`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:96](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L96)

Registers a contract class with the wallet.

#### Parameters

##### params

Contract class registration parameters

###### artifact

`ContractArtifact`

#### Returns

`Promise`\<`void`\>

#### Throws

If registration fails

***

### registerMethod()

> **registerMethod**\<`M`\>(`name`, `handler`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:13

#### Type Parameters

##### M

`M` *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

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

### registerSender()

> **registerSender**(`params`): `Promise`\<`void`\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L110)

Registers a sender with the wallet.

#### Parameters

##### params

Sender registration parameters

###### sender

`AztecAddress`

#### Returns

`Promise`\<`void`\>

#### Throws

If registration fails

***

### registerSerializer()

> **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Defined in: core/jsonrpc/dist/node.d.ts:14

#### Type Parameters

##### M

`M` *extends* keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)

#### Parameters

##### method

`M`

##### serializer

[`JSONRPCSerializer`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCSerializer.md)\<[`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"params"`\], [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)\[`M`\]\[`"result"`\]\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.registerSerializer`

***

### sendTransaction()

> **sendTransaction**(`params`): `Promise`\<`string`\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L54)

Sends a transaction to the chain.

#### Parameters

##### params

[`TransactionParams`](../type-aliases/TransactionParams.md)

Transaction parameters including function calls

#### Returns

`Promise`\<`string`\>

Transaction hash

#### Throws

If transaction fails or response invalid

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

[`JSONRPCSerializer`](https://github.com/WalletMesh/walletmesh-packages/tree/main/core/jsonrpc/docs/interfaces/JSONRPCSerializer.md)\<`unknown`, `unknown`\>

#### Returns

`void`

#### Inherited from

`JSONRPCNode.setFallbackSerializer`

***

### simulateTransaction()

> **simulateTransaction**(`params`): `Promise`\<`unknown`\>

Defined in: [aztec/rpc-wallet/src/chainProvider.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/3c9bdc4653f00d451f270132236708c0e3f71a3c/aztec/rpc-wallet/src/chainProvider.ts#L68)

Simulates a transaction without submitting it.

#### Parameters

##### params

[`TransactionFunctionCall`](../type-aliases/TransactionFunctionCall.md)

Transaction parameters to simulate

#### Returns

`Promise`\<`unknown`\>

Simulation result

#### Throws

If simulation fails
