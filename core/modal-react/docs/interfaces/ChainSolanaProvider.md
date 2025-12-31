[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainSolanaProvider

# Interface: ChainSolanaProvider

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:93

Solana provider interface following Solana Wallet Standard

## Extends

- [`BlockchainProvider`](BlockchainProvider.md)

## Methods

### connect()

> **connect**(`options?`): `Promise`\<\{ `publicKey`: `string`; \}\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:97

Connect to wallet

#### Parameters

##### options?

###### onlyIfTrusted?

`boolean`

#### Returns

`Promise`\<\{ `publicKey`: `string`; \}\>

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

### getCapabilities()

> **getCapabilities**(): `Promise`\<[`SolanaCapabilities`](SolanaCapabilities.md)\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:95

Get wallet capabilities

#### Returns

`Promise`\<[`SolanaCapabilities`](SolanaCapabilities.md)\>

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

### signAllTransactions()

> **signAllTransactions**(`transactions`): `Promise`\<`unknown`[]\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:105

Sign multiple transactions

#### Parameters

##### transactions

`unknown`[]

#### Returns

`Promise`\<`unknown`[]\>

***

### signAndSendTransaction()

> **signAndSendTransaction**(`transaction`, `options?`): `Promise`\<\{ `signature`: `string`; \}\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:107

Sign and send transaction

#### Parameters

##### transaction

`unknown`

##### options?

`unknown`

#### Returns

`Promise`\<\{ `signature`: `string`; \}\>

***

### signMessage()

> **signMessage**(`message`): `Promise`\<\{ `publicKey`: `string`; `signature`: `Uint8Array`; \}\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:111

Sign message

#### Parameters

##### message

`Uint8Array`

#### Returns

`Promise`\<\{ `publicKey`: `string`; `signature`: `Uint8Array`; \}\>

***

### signTransaction()

> **signTransaction**(`transaction`): `Promise`\<`unknown`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:103

Sign transaction

#### Parameters

##### transaction

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### switchCluster()?

> `optional` **switchCluster**(`cluster`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:116

Switch to different Solana cluster

#### Parameters

##### cluster

`"mainnet-beta"` | `"devnet"` | `"testnet"`

#### Returns

`Promise`\<`void`\>
