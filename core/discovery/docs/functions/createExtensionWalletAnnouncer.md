[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createExtensionWalletAnnouncer

# Function: createExtensionWalletAnnouncer()

> **createExtensionWalletAnnouncer**(`name`, `icon`, `rdns`, `supportedTechnologies`, `extensionId`?, `code`?, `callback`?): [`DiscoveryAnnouncer`](../classes/DiscoveryAnnouncer.md)

Defined in: [client.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/client.ts#L46)

Factory method to create a DiscoveryAnnouncer for extension wallets.

## Parameters

### name

`string`

The name of the wallet.

### icon

`string`

The icon URL of the wallet.

### rdns

`string`

The reverse DNS identifier of the wallet.

### supportedTechnologies

`string`[]

An array of supported technologies.

### extensionId?

`string`

An optional extension ID of the wallet.

### code?

`string`

An optional code for the extension wallet.

### callback?

(`origin`) => `boolean`

An optional callback function to validate the origin of the discovery request.

## Returns

[`DiscoveryAnnouncer`](../classes/DiscoveryAnnouncer.md)

An instantiated DiscoveryAnnouncer object.
