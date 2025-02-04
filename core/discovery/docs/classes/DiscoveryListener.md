[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryListener

# Class: DiscoveryListener

Defined in: [server.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/server.ts#L49)

Class representing a DiscoveryListener.

The DiscoveryListener handles discovery events, manages wallet information,
and dispatches discovery requests and acknowledgment events.

## Constructors

### new DiscoveryListener()

> **new DiscoveryListener**(`options`): [`DiscoveryListener`](DiscoveryListener.md)

Defined in: [server.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/server.ts#L62)

Creates an instance of the server.

#### Parameters

##### options

`DiscoveryListenerOptions`

The options to initialize the DiscoveryListener.

#### Returns

[`DiscoveryListener`](DiscoveryListener.md)

## Accessors

### wallets

#### Get Signature

> **get** **wallets**(): `WalletInfo`[]

Defined in: [server.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/server.ts#L75)

Gets the list of wallets.

##### Returns

`WalletInfo`[]

The list of wallets.

## Methods

### start()

> **start**(): `void`

Defined in: [server.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/server.ts#L88)

Starts the server by initializing event listeners and dispatching the initial discovery request event.

This method performs the following actions:
1. Initializes the event listeners required for handling discovery events.
2. Dispatches the initial discovery request event to start the discovery process.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [server.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/server.ts#L102)

Stops the server by removing event listeners, clearing timeouts, and resetting the state.

This method performs the following actions:
1. Removes the event listeners to stop handling discovery events.
2. Clears any active timeouts to prevent further actions.

#### Returns

`void`
