[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryAnnouncer

# Class: DiscoveryAnnouncer

Defined in: [client.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/client.ts#L89)

Class representing a DiscoveryAnnouncer.

The DiscoveryAnnouncer announces wallet information, listens for discovery requests,
and acknowledges discovery events.

## Constructors

### new DiscoveryAnnouncer()

> **new DiscoveryAnnouncer**(`options`): [`DiscoveryAnnouncer`](DiscoveryAnnouncer.md)

Defined in: [client.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/client.ts#L103)

Creates an instance of the announcer.

#### Parameters

##### options

`DiscoveryAnnouncerOptions`

The options to initialize the DiscoveryAnnouncer.

#### Returns

[`DiscoveryAnnouncer`](DiscoveryAnnouncer.md)

## Methods

### start()

> **start**(): `void`

Defined in: [client.ts:129](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/client.ts#L129)

Starts the DiscoveryAnnouncer by initializing event listeners and dispatching the initial "Ready" event.

This method performs the following actions:
1. Initializes the event listeners required for handling discovery events.
2. Dispatches the initial "Ready" event to signal that the announcer is ready.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [client.ts:144](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/client.ts#L144)

Stops the DiscoveryAnnouncer by removing event listeners and clearing internal state.

This method performs the following actions:
1. Removes the event listeners to stop handling discovery events.
2. Clears the set of acknowledged discovery IDs.
3. Clears the set of pending discovery IDs.

#### Returns

`void`
