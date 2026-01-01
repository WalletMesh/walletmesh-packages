[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SolanaProvider

# Interface: SolanaProvider

Solana Provider Interface
Common interface for injected Solana wallet providers

## Properties

### isBackpack?

> `optional` **isBackpack**: `boolean`

Backpack wallet

***

### isBraveWallet?

> `optional` **isBraveWallet**: `boolean`

Brave wallet

***

### isCoinbaseWallet?

> `optional` **isCoinbaseWallet**: `boolean`

Coinbase wallet

***

### isConnected?

> `optional` **isConnected**: `boolean`

Check if connected

***

### isExodus?

> `optional` **isExodus**: `boolean`

Exodus wallet

***

### isGlow?

> `optional` **isGlow**: `boolean`

Glow wallet

***

### isMathWallet?

> `optional` **isMathWallet**: `boolean`

MathWallet

***

### isPhantom?

> `optional` **isPhantom**: `boolean`

Phantom wallet

***

### isSlope?

> `optional` **isSlope**: `boolean`

Slope wallet

***

### isSolflare?

> `optional` **isSolflare**: `boolean`

Solflare wallet

***

### isTokenPocket?

> `optional` **isTokenPocket**: `boolean`

TokenPocket

***

### isTorus?

> `optional` **isTorus**: `boolean`

Torus wallet

***

### isTrust?

> `optional` **isTrust**: `boolean`

Trust wallet

***

### publicKey?

> `optional` **publicKey**: `object`

Public key of connected account

#### toBytes()?

> `optional` **toBytes**: () => `Uint8Array`

##### Returns

`Uint8Array`

#### toString()

> **toString**: () => `string`

##### Returns

`string`

***

### version?

> `optional` **version**: `string`

Wallet version

## Methods

### connect()

> **connect**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: \{ `toString`: () => `string`; \}; \}\>

Connect to wallet

#### Parameters

##### options?

###### onlyIfTrusted?

`boolean`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: \{ `toString`: () => `string`; \}; \}\>

***

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### off()?

> `optional` **off**(`event`, `handler`): `void`

#### Parameters

##### event

`string`

##### handler

(...`args`) => `void`

#### Returns

`void`

***

### on()?

> `optional` **on**(`event`, `handler`): `void`

Event handling

#### Parameters

##### event

`string`

##### handler

(...`args`) => `void`

#### Returns

`void`

***

### removeAllListeners()?

> `optional` **removeAllListeners**(): `void`

#### Returns

`void`

***

### removeListener()?

> `optional` **removeListener**(`event`, `handler`): `void`

#### Parameters

##### event

`string`

##### handler

(...`args`) => `void`

#### Returns

`void`

***

### signAllTransactions()?

> `optional` **signAllTransactions**(`transactions`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

Sign multiple transactions

#### Parameters

##### transactions

`unknown`[]

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`[]\>

***

### signMessage()?

> `optional` **signMessage**(`message`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `signature`: `Uint8Array`; \}\>

Sign a message

#### Parameters

##### message

`Uint8Array`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `signature`: `Uint8Array`; \}\>

***

### signTransaction()?

> `optional` **signTransaction**(`transaction`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Sign a transaction

#### Parameters

##### transaction

`unknown`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>
