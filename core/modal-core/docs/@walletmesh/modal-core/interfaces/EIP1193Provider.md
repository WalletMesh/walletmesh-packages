[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EIP1193Provider

# Interface: EIP1193Provider

EIP-1193 Provider Interface
Standard Ethereum provider as defined in EIP-1193

## Properties

### isBraveWallet?

> `optional` **isBraveWallet**: `boolean`

Brave wallet

***

### isCoinbaseWallet?

> `optional` **isCoinbaseWallet**: `boolean`

Coinbase wallet

***

### isFrame?

> `optional` **isFrame**: `boolean`

Frame wallet

***

### isMetaMask?

> `optional` **isMetaMask**: `boolean`

MetaMask wallet

***

### isRabby?

> `optional` **isRabby**: `boolean`

Rabby wallet

***

### isTokenPocket?

> `optional` **isTokenPocket**: `boolean`

TokenPocket wallet

***

### isTrust?

> `optional` **isTrust**: `boolean`

Trust wallet

***

### on()?

> `optional` **on**: (`event`, `handler`) => `void`

Subscribe to provider events

#### Parameters

##### event

`string`

##### handler

(...`args`) => `void`

#### Returns

`void`

***

### removeListener()?

> `optional` **removeListener**: (`event`, `handler`) => `void`

Unsubscribe from provider events

#### Parameters

##### event

`string`

##### handler

(...`args`) => `void`

#### Returns

`void`

***

### request()

> **request**: (`args`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Make RPC requests to the provider

#### Parameters

##### args

###### method

`string`

###### params?

`unknown`[]

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

***

### version?

> `optional` **version**: `string`

Wallet version
