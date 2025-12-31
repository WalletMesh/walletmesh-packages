[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SolanaDiscoveryService

# Class: SolanaDiscoveryService

Solana wallet discovery service
Discovers wallets via Wallet Standard and legacy injection

## Constructors

### Constructor

> **new SolanaDiscoveryService**(`config`, `logger?`): `SolanaDiscoveryService`

#### Parameters

##### config

[`SolanaDiscoveryConfig`](../interfaces/SolanaDiscoveryConfig.md) = `{}`

##### logger?

[`Logger`](Logger.md)

#### Returns

`SolanaDiscoveryService`

## Methods

### cleanup()

> **cleanup**(): `void`

Cleanup listeners and resources

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Clear all discovered wallets

#### Returns

`void`

***

### discover()

> **discover**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SolanaDiscoveryResults`](../interfaces/SolanaDiscoveryResults.md)\>

Start discovery of Solana wallets

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SolanaDiscoveryResults`](../interfaces/SolanaDiscoveryResults.md)\>

***

### getAllWallets()

> **getAllWallets**(`results?`): [`DiscoveredSolanaWallet`](../interfaces/DiscoveredSolanaWallet.md)[]

Get all discovered wallets (alias for consistency with EVM)

#### Parameters

##### results?

[`SolanaDiscoveryResults`](../interfaces/SolanaDiscoveryResults.md)

#### Returns

[`DiscoveredSolanaWallet`](../interfaces/DiscoveredSolanaWallet.md)[]

***

### getDiscoveredWallets()

> **getDiscoveredWallets**(): [`DiscoveredSolanaWallet`](../interfaces/DiscoveredSolanaWallet.md)[]

Get all discovered wallets

#### Returns

[`DiscoveredSolanaWallet`](../interfaces/DiscoveredSolanaWallet.md)[]

***

### getWalletById()

> **getWalletById**(`id`): `undefined` \| [`DiscoveredSolanaWallet`](../interfaces/DiscoveredSolanaWallet.md)

Get a specific wallet by ID

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`DiscoveredSolanaWallet`](../interfaces/DiscoveredSolanaWallet.md)
