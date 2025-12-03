[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SolanaWalletProvider

# Interface: SolanaWalletProvider

Solana-specific wallet provider following Solana Wallet Standard

## Extends

- [`IBaseWalletProvider`](IBaseWalletProvider.md)

## Properties

### connected?

> `readonly` `optional` **connected**: `boolean`

Check if the wallet is connected (Solana Wallet Standard)

## Methods

### connect()

> **connect**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: `string`; \}\>

Connect to the wallet

#### Parameters

##### options?

###### onlyIfTrusted?

`boolean`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `publicKey`: `string`; \}\>

***

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Inherited from

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`disconnect`](IBaseWalletProvider.md#disconnect)

***

### getAccounts()

> **getAccounts**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Get connected accounts

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

#### Inherited from

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`getAccounts`](IBaseWalletProvider.md#getaccounts)

***

### getChainId()

> **getChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get current chain ID

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

#### Inherited from

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`getChainId`](IBaseWalletProvider.md#getchainid)

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

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`off`](IBaseWalletProvider.md#off)

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

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`on`](IBaseWalletProvider.md#on)

***

### signMessage()

> **signMessage**(`message`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Sign a message

#### Parameters

##### message

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### signTransaction()

> **signTransaction**(`transaction`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Sign a transaction

#### Parameters

##### transaction

`unknown`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>
