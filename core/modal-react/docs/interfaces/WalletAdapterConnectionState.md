[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletAdapterConnectionState

# Interface: WalletAdapterConnectionState

Defined in: core/modal-core/dist/api/types/connection.d.ts:39

Extended connection state for wallet adapters with error handling

 WalletAdapterConnectionState

## Properties

### accounts

> **accounts**: `string`[]

Defined in: core/modal-core/dist/api/types/connection.d.ts:47

Current accounts

***

### address

> `readonly` **address**: `null` \| `string`

Defined in: core/modal-core/dist/api/types/connection.d.ts:53

Current address if connected

***

### chain

> `readonly` **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: core/modal-core/dist/api/types/connection.d.ts:55

Current chain if connected

***

### chainType

> `readonly` **chainType**: `null` \| [`ChainType`](../enumerations/ChainType.md)

Defined in: core/modal-core/dist/api/types/connection.d.ts:57

Current chain type if connected

***

### connection

> **connection**: `null` \| [`WalletConnection`](WalletConnection.md)

Defined in: core/modal-core/dist/api/types/connection.d.ts:43

Active connection if connected

***

### error

> **error**: `null` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}

Defined in: core/modal-core/dist/api/types/connection.d.ts:45

Error if status is 'error'

***

### isConnected

> `readonly` **isConnected**: `boolean`

Defined in: core/modal-core/dist/api/types/connection.d.ts:49

Whether currently connected

***

### isConnecting

> `readonly` **isConnecting**: `boolean`

Defined in: core/modal-core/dist/api/types/connection.d.ts:51

Whether currently connecting

***

### status

> **status**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: core/modal-core/dist/api/types/connection.d.ts:41

Current connection status including error state
