[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createWebWalletAnnouncer

# Function: createWebWalletAnnouncer()

> **createWebWalletAnnouncer**(`name`, `icon`, `rdns`, `url`, `supportedTechnologies`, `callback`?): [`DiscoveryAnnouncer`](../classes/DiscoveryAnnouncer.md)

Defined in: [client.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/client.ts#L21)

Factory method to create a DiscoveryAnnouncer for web wallets.

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

### url

`string`

The URL of the web wallet.

### supportedTechnologies

`string`[]

An array of supported technologies.

### callback?

(`origin`) => `boolean`

An optional callback function to validate the origin of the discovery request.

## Returns

[`DiscoveryAnnouncer`](../classes/DiscoveryAnnouncer.md)

An instantiated DiscoveryAnnouncer object.
