[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryConnectionManager

# Interface: DiscoveryConnectionManager

Connection manager interface for the discovery protocol

Provides connection lifecycle management for discovered wallets.
This interface abstracts the connection process, allowing for
dependency injection in tests and different implementations.

## Methods

### connect()

> **connect**(`qualifiedWallet`, `options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `accounts`: `object`[]; `connectionId`: `string`; \}\>

Connect to a discovered wallet

#### Parameters

##### qualifiedWallet

[`QualifiedWallet`](QualifiedWallet.md)

The qualified wallet responder from discovery

##### options

Connection options including chains and permissions

###### requestedChains

`string`[]

Requested blockchain networks

###### requestedPermissions

`string`[]

Requested permissions from the wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `accounts`: `object`[]; `connectionId`: `string`; \}\>

Promise resolving to connection details

***

### disconnect()

> **disconnect**(`responderId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from a wallet

#### Parameters

##### responderId

`string`

The ID of the wallet responder to disconnect

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete
