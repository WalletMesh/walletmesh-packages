[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ClientDiscoveryEvent

# Interface: ClientDiscoveryEvent

Discovery event data

## Properties

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Additional metadata

***

### type

> **type**: `"wallet_discovered"` \| `"wallet_available"` \| `"wallet_unavailable"`

Type of discovery event

***

### walletInfo

> **walletInfo**: [`WalletInfo`](WalletInfo.md)

Wallet information
