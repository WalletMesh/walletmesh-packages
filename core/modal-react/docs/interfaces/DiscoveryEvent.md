[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DiscoveryEvent

# Interface: DiscoveryEvent

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:143

Discovery event data

## Properties

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:149

Additional metadata

***

### type

> **type**: `"wallet_discovered"` \| `"wallet_available"` \| `"wallet_unavailable"`

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:145

Type of discovery event

***

### walletInfo

> **walletInfo**: [`WalletInfo`](WalletInfo.md)

Defined in: core/modal-core/dist/client/WalletMeshClient.d.ts:147

Wallet information
