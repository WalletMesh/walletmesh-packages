[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / BlockchainProvider

# Interface: BlockchainProvider

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:25

Common base interface for all blockchain providers

This interface extends CommonProviderInterface to ensure consistency with
the WalletProvider system.

## Extends

- `CommonProviderInterface`

## Extended by

- [`EVMProvider`](EVMProvider.md)
- [`ChainSolanaProvider`](ChainSolanaProvider.md)

## Methods

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:41

Disconnect from provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when disconnection is complete

#### Inherited from

`CommonProviderInterface.disconnect`

***

### getAccounts()

> **getAccounts**(): `Promise`\<`string`[]\>

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:29

Get connected accounts/addresses

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of account addresses

#### Inherited from

`CommonProviderInterface.getAccounts`

***

### getChainId()

> **getChainId**(): `Promise`\<`string` \| `number`\>

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:35

Get current chain ID

#### Returns

`Promise`\<`string` \| `number`\>

Promise resolving to chain ID as string or number

#### Inherited from

`CommonProviderInterface.getChainId`

***

### off()

> **off**(`event`, `listener`): `void`

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:55

Remove event listener

#### Parameters

##### event

`string`

Event name to stop listening for

##### listener

(...`args`) => `void`

Callback function to remove

#### Returns

`void`

#### Inherited from

`CommonProviderInterface.off`

***

### on()

> **on**(`event`, `listener`): `void`

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:48

Add event listener

#### Parameters

##### event

`string`

Event name to listen for

##### listener

(...`args`) => `void`

Callback function to invoke when event occurs

#### Returns

`void`

#### Inherited from

`CommonProviderInterface.on`

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `void`

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:62

Remove all event listeners

#### Parameters

##### event?

`string`

Optional event name to remove all listeners for.
               If not provided, removes all listeners for all events.

#### Returns

`void`

#### Inherited from

`CommonProviderInterface.removeAllListeners`

***

### request()

> **request**(`args`): `Promise`\<`unknown`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:27

Request method call for JSON-RPC communication

#### Parameters

##### args

###### method

`string`

###### params?

`unknown`[] \| `Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`unknown`\>
