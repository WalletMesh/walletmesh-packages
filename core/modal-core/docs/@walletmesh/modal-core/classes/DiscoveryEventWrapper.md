[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryEventWrapper

# Class: DiscoveryEventWrapper

Wraps discovery protocol with event-based interface

## Constructors

### Constructor

> **new DiscoveryEventWrapper**(`discoveryInitiator`, `connectionManager`, `logger`, `config`): `DiscoveryEventWrapper`

#### Parameters

##### discoveryInitiator

[`DiscoveryInitiator`](../interfaces/DiscoveryInitiator.md)

##### connectionManager

[`DiscoveryConnectionManager`](../interfaces/DiscoveryConnectionManager.md)

##### logger

[`Logger`](Logger.md)

##### config

[`EventWrapperConfig`](../interfaces/EventWrapperConfig.md) = `{}`

#### Returns

`DiscoveryEventWrapper`

## Methods

### addEventListener()

> **addEventListener**(`callback`): () => `void`

Add event listener

#### Parameters

##### callback

(`event`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### cleanup()

> **cleanup**(): `void`

Clean up all resources and event listeners

#### Returns

`void`

***

### connectToWallet()

> **connectToWallet**(`wallet`, `sessionId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `sessionId`: `string`; `transport`: `unknown`; \}\>

Establish connection to a discovered wallet

#### Parameters

##### wallet

[`QualifiedWallet`](../interfaces/QualifiedWallet.md)

##### sessionId?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `sessionId`: `string`; `transport`: `unknown`; \}\>

***

### startDiscovery()

> **startDiscovery**(`initiator?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]\>

Start discovery with event emissions

#### Parameters

##### initiator?

[`DiscoveryInitiator`](../interfaces/DiscoveryInitiator.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`QualifiedWallet`](../interfaces/QualifiedWallet.md)[]\>

***

### stopDiscovery()

> **stopDiscovery**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Stop discovery if in progress

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### updateDiscoveryInitiator()

> **updateDiscoveryInitiator**(`discoveryInitiator`): `void`

Update the discovery initiator instance
This allows using a fresh initiator for each discovery session

#### Parameters

##### discoveryInitiator

[`DiscoveryInitiator`](../interfaces/DiscoveryInitiator.md)

#### Returns

`void`
