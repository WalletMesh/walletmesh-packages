[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainSolanaProvider

# Interface: ChainSolanaProvider

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:94

Solana provider interface following Solana Wallet Standard

## Extends

- [`BlockchainProvider`](BlockchainProvider.md)

## Methods

### connect()

> **connect**(`options?`): `Promise`\<\{ `publicKey`: `string`; \}\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:98

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

### getCapabilities()

> **getCapabilities**(): `Promise`\<[`SolanaCapabilities`](SolanaCapabilities.md)\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:96

Get wallet capabilities

#### Returns

`Promise`\<[`SolanaCapabilities`](SolanaCapabilities.md)\>

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

### signAllTransactions()

> **signAllTransactions**(`transactions`): `Promise`\<`unknown`[]\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:106

Sign multiple transactions

#### Parameters

##### transactions

`unknown`[]

#### Returns

`Promise`\<`unknown`[]\>

***

### signAndSendTransaction()

> **signAndSendTransaction**(`transaction`, `options?`): `Promise`\<\{ `signature`: `string`; \}\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:108

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

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:112

Sign message

#### Parameters

##### message

`Uint8Array`

#### Returns

`Promise`\<\{ `publicKey`: `string`; `signature`: `Uint8Array`; \}\>

***

### signTransaction()

> **signTransaction**(`transaction`): `Promise`\<`unknown`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:104

Sign transaction

#### Parameters

##### transaction

`unknown`

#### Returns

`Promise`\<`unknown`\>

***

### switchCluster()?

> `optional` **switchCluster**(`cluster`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/chainProviders.d.ts:117

Switch to different Solana cluster

#### Parameters

##### cluster

`"mainnet-beta"` | `"devnet"` | `"testnet"`

#### Returns

`Promise`\<`void`\>
