[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EVMProvider

# Interface: EVMProvider

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:36

EVM-compatible provider interface following EIP-1193 standard

## Extends

- [`BlockchainProvider`](BlockchainProvider.md)

## Methods

### addChain()

> **addChain**(`chain`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:46

Add a new chain to the wallet

#### Parameters

##### chain

[`EVMChainConfig`](EVMChainConfig.md)

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:20

Disconnect the provider

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`disconnect`](BlockchainProvider.md#disconnect)

***

### getAddresses()

> **getAddresses**(): `Promise`\<`string`[]\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:16

Get the current account addresses

#### Returns

`Promise`\<`string`[]\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`getAddresses`](BlockchainProvider.md#getaddresses)

***

### getChainId()

> **getChainId**(): `Promise`\<`string` \| `number`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:18

Get the current chain ID

#### Returns

`Promise`\<`string` \| `number`\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`getChainId`](BlockchainProvider.md#getchainid)

***

### off()

> **off**(`event`, `listener`): `void`

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:24

Remove event listener

#### Parameters

##### event

`string`

##### listener

(...`args`) => `void`

#### Returns

`void`

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`off`](BlockchainProvider.md#off)

***

### on()

> **on**(`event`, `listener`): `void`

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:22

Add event listener

#### Parameters

##### event

`string`

##### listener

(...`args`) => `void`

#### Returns

`void`

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`on`](BlockchainProvider.md#on)

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `void`

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:26

Remove all event listeners

#### Parameters

##### event?

`string`

#### Returns

`void`

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`removeAllListeners`](BlockchainProvider.md#removealllisteners)

***

### request()

> **request**(`args`): `Promise`\<`unknown`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:28

Request method call for JSON-RPC communication

#### Parameters

##### args

###### method

`string`

###### params?

`unknown`[] \| `Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`unknown`\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`request`](BlockchainProvider.md#request)

***

### sendTransaction()

> **sendTransaction**(`transaction`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:38

Send transaction

#### Parameters

##### transaction

[`EVMTransactionRequest`](EVMTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signMessage()

> **signMessage**(`message`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:40

Sign message

#### Parameters

##### message

`string`

#### Returns

`Promise`\<`string`\>

***

### signTypedData()

> **signTypedData**(`typedData`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:42

Sign typed data (EIP-712)

#### Parameters

##### typedData

`unknown`

#### Returns

`Promise`\<`string`\>

***

### switchChain()

> **switchChain**(`chainId`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:44

Switch to a different chain

#### Parameters

##### chainId

`string`

#### Returns

`Promise`\<`void`\>

***

### watchAsset()

> **watchAsset**(`asset`): `Promise`\<`boolean`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:48

Watch for asset changes

#### Parameters

##### asset

[`EVMAssetConfig`](EVMAssetConfig.md)

#### Returns

`Promise`\<`boolean`\>
