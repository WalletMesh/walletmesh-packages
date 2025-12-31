[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SolanaProvider

# Interface: SolanaProvider

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:60

Solana Provider Interface
Common interface for injected Solana wallet providers

## Properties

### isBackpack?

> `optional` **isBackpack**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:96

Backpack wallet

***

### isBraveWallet?

> `optional` **isBraveWallet**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:112

Brave wallet

***

### isCoinbaseWallet?

> `optional` **isCoinbaseWallet**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:104

Coinbase wallet

***

### isConnected?

> `optional` **isConnected**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:67

Check if connected

***

### isExodus?

> `optional` **isExodus**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:102

Exodus wallet

***

### isGlow?

> `optional` **isGlow**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:98

Glow wallet

***

### isMathWallet?

> `optional` **isMathWallet**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:106

MathWallet

***

### isPhantom?

> `optional` **isPhantom**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:92

Phantom wallet

***

### isSlope?

> `optional` **isSlope**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:108

Slope wallet

***

### isSolflare?

> `optional` **isSolflare**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:94

Solflare wallet

***

### isTokenPocket?

> `optional` **isTokenPocket**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:114

TokenPocket

***

### isTorus?

> `optional` **isTorus**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:110

Torus wallet

***

### isTrust?

> `optional` **isTrust**: `boolean`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:100

Trust wallet

***

### publicKey?

> `optional` **publicKey**: `object`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:62

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

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:116

Wallet version

## Methods

### connect()

> **connect**(`options?`): `Promise`\<\{ `publicKey`: \{ `toString`: () => `string`; \}; \}\>

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:69

Connect to wallet

#### Parameters

##### options?

###### onlyIfTrusted?

`boolean`

#### Returns

`Promise`\<\{ `publicKey`: \{ `toString`: () => `string`; \}; \}\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:77

Disconnect from wallet

#### Returns

`Promise`\<`void`\>

***

### off()?

> `optional` **off**(`event`, `handler`): `void`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:88

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

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:87

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

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:90

#### Returns

`void`

***

### removeListener()?

> `optional` **removeListener**(`event`, `handler`): `void`

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:89

#### Parameters

##### event

`string`

##### handler

(...`args`) => `void`

#### Returns

`void`

***

### signAllTransactions()?

> `optional` **signAllTransactions**(`transactions`): `Promise`\<`unknown`[]\>

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:81

Sign multiple transactions

#### Parameters

##### transactions

`unknown`[]

#### Returns

`Promise`\<`unknown`[]\>

***

### signMessage()?

> `optional` **signMessage**(`message`): `Promise`\<\{ `signature`: `Uint8Array`; \}\>

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:83

Sign a message

#### Parameters

##### message

`Uint8Array`

#### Returns

`Promise`\<\{ `signature`: `Uint8Array`; \}\>

***

### signTransaction()?

> `optional` **signTransaction**(`transaction`): `Promise`\<`unknown`\>

Defined in: core/modal-core/dist/client/discovery/solana/types.d.ts:79

Sign a transaction

#### Parameters

##### transaction

`unknown`

#### Returns

`Promise`\<`unknown`\>
