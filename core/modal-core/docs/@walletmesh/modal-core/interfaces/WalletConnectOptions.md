[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletConnectOptions

# Interface: WalletConnectOptions

Options for connecting to a wallet

## Extends

- [`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md)

## Indexable

\[`key`: `string`\]: `unknown`

Additional adapter-specific options

## Properties

### chain?

> `optional` **chain**: `object`

Chain to connect to initially

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### name

> **name**: `string`

Human-readable name of the chain

#### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

***

### chains?

> `optional` **chains**: `object`[]

Request specific chains

#### chainId?

> `optional` **chainId**: `string`

#### type

> **type**: [`ChainType`](../enumerations/ChainType.md)

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`chains`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#chains)

***

### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

Force a specific chain type

***

### isReconnection?

> `optional` **isReconnection**: `boolean`

Whether this is a reconnection attempt

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`isReconnection`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#isreconnection)

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

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`logger`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#logger)

***

### projectId?

> `optional` **projectId**: `string`

Optional project ID for services like WalletConnect

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`projectId`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#projectid)

***

### providerOptions?

> `optional` **providerOptions**: `Record`\<`string`, `unknown`\>

Additional provider-specific options

***

### requestNewSession?

> `optional` **requestNewSession**: `boolean`

Force creation of a new session even if sessionId is provided

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`requestNewSession`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#requestnewsession)

***

### requiredFeatures?

> `optional` **requiredFeatures**: `string`[]

Request specific features

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`requiredFeatures`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#requiredfeatures)

***

### rpcUrls?

> `optional` **rpcUrls**: `Record`\<`string`, `string`\>

Custom RPC URLs

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`rpcUrls`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#rpcurls)

***

### sessionId?

> `optional` **sessionId**: `string`

Session ID for reconnection attempts

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`sessionId`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#sessionid)

***

### silent?

> `optional` **silent**: `boolean`

Silent connection (no modal)

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`silent`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#silent)

***

### timeout?

> `optional` **timeout**: `number`

Connection timeout in milliseconds

#### Inherited from

[`ConnectOptions`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md).[`timeout`](../../../internal/types/typedocExports/interfaces/ConnectOptions.md#timeout)
