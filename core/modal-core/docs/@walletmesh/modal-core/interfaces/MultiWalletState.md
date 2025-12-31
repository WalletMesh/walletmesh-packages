[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / MultiWalletState

# Interface: MultiWalletState

Multi-wallet connection tracking
For future multi-wallet support

 MultiWalletState

## Properties

### activeWalletId

> **activeWalletId**: `null` \| `string`

***

### config

> **config**: `object`

#### autoReconnect

> **autoReconnect**: `boolean`

#### maxConnections

> **maxConnections**: `number`

#### reconnectDelay

> **reconnectDelay**: `number`

***

### connections

> **connections**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`ApiConnectionState`](../../../internal/types/typedocExports/interfaces/ApiConnectionState.md)\>
