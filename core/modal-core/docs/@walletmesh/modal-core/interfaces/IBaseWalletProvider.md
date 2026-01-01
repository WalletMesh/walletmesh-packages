[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / IBaseWalletProvider

# Interface: IBaseWalletProvider

Base wallet provider interface

Wallet providers use the wallet's RPC endpoints for both read and write operations,
enabling transaction signing and other privileged operations.

This interface extends CommonProviderInterface to ensure consistency with
the BlockchainProvider system.

## Extends

- `CommonProviderInterface`

## Extended by

- [`EvmWalletProvider`](EvmWalletProvider.md)
- [`SolanaWalletProvider`](SolanaWalletProvider.md)
- [`AztecWalletProvider`](AztecWalletProvider.md)

## Methods

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from provider

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

#### Inherited from

`CommonProviderInterface.disconnect`

***

### getAccounts()

> **getAccounts**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Get connected accounts/addresses

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to array of account addresses

#### Inherited from

`CommonProviderInterface.getAccounts`

***

### getChainId()

> **getChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `number`\>

Get current chain ID

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string` \| `number`\>

Promise resolving to chain ID as string or number

#### Inherited from

`CommonProviderInterface.getChainId`

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

`CommonProviderInterface.off`

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

`CommonProviderInterface.on`

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

`CommonProviderInterface.removeAllListeners`
