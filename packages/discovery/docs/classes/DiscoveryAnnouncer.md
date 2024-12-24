[@walletmesh/discovery - v0.0.5](../README.md) / [Exports](../modules.md) / DiscoveryAnnouncer

# Class: DiscoveryAnnouncer

Class representing a DiscoveryAnnouncer.

The DiscoveryAnnouncer announces wallet information, listens for discovery requests,
and acknowledges discovery events.

## Table of contents

### Constructors

- [constructor](DiscoveryAnnouncer.md#constructor)

### Methods

- [start](DiscoveryAnnouncer.md#start)
- [stop](DiscoveryAnnouncer.md#stop)

## Constructors

### constructor

• **new DiscoveryAnnouncer**(`options`): [`DiscoveryAnnouncer`](DiscoveryAnnouncer.md)

Creates an instance of the announcer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `DiscoveryAnnouncerOptions` | The options to initialize the DiscoveryAnnouncer. |

#### Returns

[`DiscoveryAnnouncer`](DiscoveryAnnouncer.md)

#### Defined in

[client.ts:103](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/discovery/src/client.ts#L103)

## Methods

### start

▸ **start**(): `void`

Starts the DiscoveryAnnouncer by initializing event listeners and dispatching the initial "Ready" event.

This method performs the following actions:
1. Initializes the event listeners required for handling discovery events.
2. Dispatches the initial "Ready" event to signal that the announcer is ready.

#### Returns

`void`

#### Defined in

[client.ts:129](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/discovery/src/client.ts#L129)

___

### stop

▸ **stop**(): `void`

Stops the DiscoveryAnnouncer by removing event listeners and clearing internal state.

This method performs the following actions:
1. Removes the event listeners to stop handling discovery events.
2. Clears the set of acknowledged discovery IDs.
3. Clears the set of pending discovery IDs.

#### Returns

`void`

#### Defined in

[client.ts:144](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/discovery/src/client.ts#L144)
