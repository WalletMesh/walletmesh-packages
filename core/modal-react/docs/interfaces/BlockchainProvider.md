[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / BlockchainProvider

# Interface: BlockchainProvider

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:14

Common base interface for all blockchain providers

## Extended by

- [`EVMProvider`](EVMProvider.md)
- [`ChainSolanaProvider`](ChainSolanaProvider.md)

## Methods

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:20

Disconnect the provider

#### Returns

`Promise`\<`void`\>

***

### getAddresses()

> **getAddresses**(): `Promise`\<`string`[]\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:16

Get the current account addresses

#### Returns

`Promise`\<`string`[]\>

***

### getChainId()

> **getChainId**(): `Promise`\<`string` \| `number`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:18

Get the current chain ID

#### Returns

`Promise`\<`string` \| `number`\>

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
