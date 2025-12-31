[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AztecWalletProvider

# Interface: AztecWalletProvider

Aztec-specific wallet provider

## Extends

- [`IBaseWalletProvider`](IBaseWalletProvider.md)

## Methods

### call()

> **call**\<`T`\>(`method`, `params?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Call an Aztec wallet method

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### method

`string`

##### params?

`unknown`[]

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

***

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from provider

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

#### Inherited from

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`disconnect`](IBaseWalletProvider.md#disconnect)

***

### getAccounts()

> **getAccounts**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Get connected accounts/addresses

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to array of account addresses

#### Inherited from

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`getAccounts`](IBaseWalletProvider.md#getaccounts)

***

### getAddress()

> **getAddress**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get the Aztec account address

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### getChainId()

> **getChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `number`\>

Get current chain ID

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `number`\>

Promise resolving to chain ID as string or number

#### Inherited from

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`getChainId`](IBaseWalletProvider.md#getchainid)

***

### off()

> **off**(`event`, `listener`): `void`

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

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`off`](IBaseWalletProvider.md#off)

***

### on()

> **on**(`event`, `listener`): `void`

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

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`on`](IBaseWalletProvider.md#on)

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `void`

Remove all event listeners

#### Parameters

##### event?

`string`

Optional event name to remove all listeners for.
               If not provided, removes all listeners for all events.

#### Returns

`void`

#### Inherited from

[`IBaseWalletProvider`](IBaseWalletProvider.md).[`removeAllListeners`](IBaseWalletProvider.md#removealllisteners)
