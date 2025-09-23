[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMeshClientConfig

# Interface: WalletMeshClientConfig

Configuration options for WalletMeshClient

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Optional application description

***

### appIcon?

> `optional` **appIcon**: `string`

Application icon URL

***

### appName

> **appName**: `string`

Application name displayed to users

***

### appUrl?

> `optional` **appUrl**: `string`

Application URL

***

### chains?

> `optional` **chains**: `object`[]

Supported chain configurations

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

### debug?

> `optional` **debug**: `boolean`

Enable debug mode

***

### discovery?

> `optional` **discovery**: `object`

Discovery service configuration

#### enabled?

> `optional` **enabled**: `boolean`

#### retryInterval?

> `optional` **retryInterval**: `number`

#### timeout?

> `optional` **timeout**: `number`

***

### logger?

> `optional` **logger**: `object`

Logger configuration

#### debug?

> `optional` **debug**: `boolean`

Enable debug logging

#### level?

> `optional` **level**: `"error"` \| `"debug"` \| `"info"` \| `"warn"` \| `"silent"`

Log level

#### prefix?

> `optional` **prefix**: `string`

Custom logger prefix

***

### projectId?

> `optional` **projectId**: `string`

WalletConnect project ID

***

### providerLoader?

> `optional` **providerLoader**: `object`

Provider loader configuration

#### customProviders?

> `optional` **customProviders**: `Record`\<[`ChainType`](../enumerations/ChainType.md), () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `AztecProvider?`: [`ProviderClass`](../type-aliases/ProviderClass.md); `default?`: [`ProviderClass`](../type-aliases/ProviderClass.md); `EvmProvider?`: [`ProviderClass`](../type-aliases/ProviderClass.md); `SolanaProvider?`: [`ProviderClass`](../type-aliases/ProviderClass.md); \}\>\>

#### preloadChainTypes?

> `optional` **preloadChainTypes**: [`ChainType`](../enumerations/ChainType.md)[]

#### preloadOnInit?

> `optional` **preloadOnInit**: `boolean`

***

### supportedInterfaces?

> `optional` **supportedInterfaces**: `object`

Supported interfaces per technology for discovery

#### aztec?

> `optional` **aztec**: `string`[]

Aztec interfaces (e.g., ['aztec-wallet-api-v1', 'aztec-connect-v2'])

#### evm?

> `optional` **evm**: `string`[]

EVM interfaces (e.g., ['eip-1193', 'eip-6963'])

#### solana?

> `optional` **solana**: `string`[]

Solana interfaces (e.g., ['solana-standard-wallet'])

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[] \| ([`WalletAdapter`](WalletAdapter.md) \| [`WalletAdapterClass`](../type-aliases/WalletAdapterClass.md))[] \| \{ `custom?`: ([`WalletAdapter`](WalletAdapter.md) \| [`WalletAdapterClass`](../type-aliases/WalletAdapterClass.md))[]; `exclude?`: `string`[]; `filter?`: (`adapter`) => `boolean`; `include?`: `string`[]; `order?`: `string`[]; \}

Wallet configuration options
