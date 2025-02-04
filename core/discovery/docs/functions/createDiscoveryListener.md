[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createDiscoveryListener

# Function: createDiscoveryListener()

> **createDiscoveryListener**(`technologies`, `callback`?): [`DiscoveryListener`](../classes/DiscoveryListener.md)

Defined in: [server.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/discovery/src/server.ts#L17)

Factory method to create a DiscoveryListener.

## Parameters

### technologies

`string`[]

An array of technologies to initialize.

### callback?

(`wallet`) => `void`

An optional callback function to handle wallet information.

## Returns

[`DiscoveryListener`](../classes/DiscoveryListener.md)

An instantiated DiscoveryListener object.
