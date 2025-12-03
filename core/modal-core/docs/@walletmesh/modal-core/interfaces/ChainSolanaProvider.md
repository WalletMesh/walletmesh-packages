[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSolanaProvider

# Interface: ChainSolanaProvider

Solana provider interface following Solana Wallet Standard

## Extends

- [`BlockchainProvider`](BlockchainProvider.md)

## Methods

### connect()

> **connect**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: `string`; \}\>

Connect to wallet

#### Parameters

##### options?

###### onlyIfTrusted?

`boolean`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: `string`; \}\>

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

### getCapabilities()

> **getCapabilities**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SolanaCapabilities`](SolanaCapabilities.md)\>

Get wallet capabilities

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SolanaCapabilities`](SolanaCapabilities.md)\>

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

### signAllTransactions()

> **signAllTransactions**(`transactions`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

Sign multiple transactions

#### Parameters

##### transactions

`unknown`[]

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

***

### signAndSendTransaction()

> **signAndSendTransaction**(`transaction`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `signature`: `string`; \}\>

Sign and send transaction

#### Parameters

##### transaction

`unknown`

##### options?

`unknown`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `signature`: `string`; \}\>

***

### signMessage()

> **signMessage**(`message`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: `string`; `signature`: `Uint8Array`; \}\>

Sign message

#### Parameters

##### message

`Uint8Array`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: `string`; `signature`: `Uint8Array`; \}\>

***

### signTransaction()

> **signTransaction**(`transaction`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Sign transaction

#### Parameters

##### transaction

`unknown`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

***

### switchCluster()?

> `optional` **switchCluster**(`cluster`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Switch to different Solana cluster

#### Parameters

##### cluster

`"mainnet-beta"` | `"devnet"` | `"testnet"`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
