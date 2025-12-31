[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EVMProvider

# Interface: EVMProvider

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:35

EVM-compatible provider interface following EIP-1193 standard

## Extends

- [`BlockchainProvider`](BlockchainProvider.md)

## Methods

### addChain()

> **addChain**(`chain`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:45

Add a new chain to the wallet

#### Parameters

##### chain

[`EVMChainConfig`](EVMChainConfig.md)

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:41

Disconnect from provider

#### Returns

`Promise`\<`void`\>

Promise that resolves when disconnection is complete

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`disconnect`](BlockchainProvider.md#disconnect)

***

### getAccounts()

> **getAccounts**(): `Promise`\<`string`[]\>

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:29

Get connected accounts/addresses

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of account addresses

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`getAccounts`](BlockchainProvider.md#getaccounts)

***

### getChainId()

> **getChainId**(): `Promise`\<`string` \| `number`\>

Defined in: core/modal-core/dist/api/types/commonProvider.d.ts:35

Get current chain ID

#### Returns

`Promise`\<`string` \| `number`\>

Promise resolving to chain ID as string or number

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`getChainId`](BlockchainProvider.md#getchainid)

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

[`BlockchainProvider`](BlockchainProvider.md).[`off`](BlockchainProvider.md#off)

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

[`BlockchainProvider`](BlockchainProvider.md).[`on`](BlockchainProvider.md#on)

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

[`BlockchainProvider`](BlockchainProvider.md).[`removeAllListeners`](BlockchainProvider.md#removealllisteners)

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

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`request`](BlockchainProvider.md#request)

***

### sendTransaction()

> **sendTransaction**(`transaction`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:37

Send transaction

#### Parameters

##### transaction

[`EVMTransactionRequest`](EVMTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signMessage()

> **signMessage**(`message`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:39

Sign message

#### Parameters

##### message

`string`

#### Returns

`Promise`\<`string`\>

***

### signTypedData()

> **signTypedData**(`typedData`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:41

Sign typed data (EIP-712)

#### Parameters

##### typedData

`unknown`

#### Returns

`Promise`\<`string`\>

***

### switchChain()

> **switchChain**(`chainId`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:43

Switch to a different chain

#### Parameters

##### chainId

`string`

#### Returns

`Promise`\<`void`\>

***

### watchAsset()

> **watchAsset**(`asset`): `Promise`\<`boolean`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:47

Watch for asset changes

#### Parameters

##### asset

[`EVMAssetConfig`](EVMAssetConfig.md)

#### Returns

`Promise`\<`boolean`\>
