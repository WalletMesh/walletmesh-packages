[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletConnectionState

# Interface: WalletConnectionState

Defined in: core/modal-core/dist/api/types/connection.d.ts:19

Base connection state interface - the canonical version

 WalletConnectionState

## Properties

### accounts

> **accounts**: `string`[]

Defined in: core/modal-core/dist/api/types/connection.d.ts:25

List of connected account addresses

***

### address

> **address**: `null` \| `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:31

Primary connected address (first account)

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: core/modal-core/dist/api/types/connection.d.ts:27

Currently connected chain

***

### chainType

> **chainType**: `null` \| [`ChainType`](../enumerations/ChainType.md)

Defined in: core/modal-core/dist/api/types/connection.d.ts:29

Type of blockchain network

***

### status

> **status**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: core/modal-core/dist/api/types/connection.d.ts:21

Current connection status

***

### walletId

> **walletId**: `null` \| `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:23

ID of the connected wallet
