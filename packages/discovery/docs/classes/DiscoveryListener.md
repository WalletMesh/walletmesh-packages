[@walletmesh/discovery - v0.0.5](../README.md) / [Exports](../modules.md) / DiscoveryListener

# Class: DiscoveryListener

Class representing a DiscoveryListener.

The DiscoveryListener handles discovery events, manages wallet information,
and dispatches discovery requests and acknowledgment events.

## Table of contents

### Constructors

- [constructor](DiscoveryListener.md#constructor)

### Accessors

- [wallets](DiscoveryListener.md#wallets)

### Methods

- [start](DiscoveryListener.md#start)
- [stop](DiscoveryListener.md#stop)

## Constructors

### constructor

• **new DiscoveryListener**(`options`): [`DiscoveryListener`](DiscoveryListener.md)

Creates an instance of the server.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `DiscoveryListenerOptions` | The options to initialize the DiscoveryListener. |

#### Returns

[`DiscoveryListener`](DiscoveryListener.md)

#### Defined in

[server.ts:62](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/discovery/src/server.ts#L62)

## Accessors

### wallets

• `get` **wallets**(): `WalletInfo`[]

Gets the list of wallets.

#### Returns

`WalletInfo`[]

The list of wallets.

#### Defined in

[server.ts:75](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/discovery/src/server.ts#L75)

## Methods

### start

▸ **start**(): `void`

Starts the server by initializing event listeners and dispatching the initial discovery request event.

This method performs the following actions:
1. Initializes the event listeners required for handling discovery events.
2. Dispatches the initial discovery request event to start the discovery process.

#### Returns

`void`

#### Defined in

[server.ts:88](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/discovery/src/server.ts#L88)

___

### stop

▸ **stop**(): `void`

Stops the server by removing event listeners, clearing timeouts, and resetting the state.

This method performs the following actions:
1. Removes the event listeners to stop handling discovery events.
2. Clears any active timeouts to prevent further actions.

#### Returns

`void`

#### Defined in

[server.ts:102](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/discovery/src/server.ts#L102)
