[**@walletmesh/modal-core v0.0.3**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ConnectOptions

# Interface: ConnectOptions

Options for connecting to a wallet

## Indexable

\[`key`: `string`\]: `unknown`

Additional adapter-specific options

## Properties

### chains?

> `optional` **chains**: `object`[]

Request specific chains

#### chainId?

> `optional` **chainId**: `string`

#### type

> **type**: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

***

### isReconnection?

> `optional` **isReconnection**: `boolean`

Whether this is a reconnection attempt

***

### logger?

> `optional` **logger**: `object`

Optional logger instance

#### debug()

> **debug**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

#### error()

> **error**(`message`, `error?`): `void`

##### Parameters

###### message

`string`

###### error?

`unknown`

##### Returns

`void`

#### info()

> **info**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

#### warn()

> **warn**(`message`, ...`args`): `void`

##### Parameters

###### message

`string`

###### args

...`unknown`[]

##### Returns

`void`

***

### projectId?

> `optional` **projectId**: `string`

Optional project ID for services like WalletConnect

***

### requestNewSession?

> `optional` **requestNewSession**: `boolean`

Force creation of a new session even if sessionId is provided

***

### requiredFeatures?

> `optional` **requiredFeatures**: `string`[]

Request specific features

***

### rpcUrls?

> `optional` **rpcUrls**: `Record`\<`string`, `string`\>

Custom RPC URLs

***

### sessionId?

> `optional` **sessionId**: `string`

Session ID for reconnection attempts

***

### silent?

> `optional` **silent**: `boolean`

Silent connection (no modal)

***

### timeout?

> `optional` **timeout**: `number`

Connection timeout in milliseconds
