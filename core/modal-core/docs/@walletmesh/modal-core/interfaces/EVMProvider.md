[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EVMProvider

# Interface: EVMProvider

EVM-compatible provider interface following EIP-1193 standard

## Extends

- [`BlockchainProvider`](BlockchainProvider.md)

## Methods

### addChain()

> **addChain**(`chain`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Add a new chain to the wallet

#### Parameters

##### chain

[`EVMChainConfig`](EVMChainConfig.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect the provider

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`disconnect`](BlockchainProvider.md#disconnect)

***

### getAddresses()

> **getAddresses**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Get the current account addresses

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`getAddresses`](BlockchainProvider.md#getaddresses)

***

### getChainId()

> **getChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `number`\>

Get the current chain ID

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `number`\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`getChainId`](BlockchainProvider.md#getchainid)

***

### off()

> **off**(`event`, `listener`): `void`

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

> **request**(`args`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Request method call for JSON-RPC communication

#### Parameters

##### args

###### method

`string`

###### params?

`unknown`[] \| `Record`\<`string`, `unknown`\>

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

#### Inherited from

[`BlockchainProvider`](BlockchainProvider.md).[`request`](BlockchainProvider.md#request)

***

### sendTransaction()

> **sendTransaction**(`transaction`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Send transaction

#### Parameters

##### transaction

[`EVMTransactionRequest`](EVMTransactionRequest.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### signMessage()

> **signMessage**(`message`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Sign message

#### Parameters

##### message

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### signTypedData()

> **signTypedData**(`typedData`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Sign typed data (EIP-712)

#### Parameters

##### typedData

`unknown`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### switchChain()

> **switchChain**(`chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Switch to a different chain

#### Parameters

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### watchAsset()

> **watchAsset**(`asset`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Watch for asset changes

#### Parameters

##### asset

[`EVMAssetConfig`](EVMAssetConfig.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>
