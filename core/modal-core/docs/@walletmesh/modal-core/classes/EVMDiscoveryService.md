[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EVMDiscoveryService

# Class: EVMDiscoveryService

EVM wallet discovery service
Discovers wallets via EIP-6963 and legacy window.ethereum

## Constructors

### Constructor

> **new EVMDiscoveryService**(`config`, `logger?`): `EVMDiscoveryService`

#### Parameters

##### config

[`EVMDiscoveryConfig`](../interfaces/EVMDiscoveryConfig.md) = `{}`

##### logger?

[`Logger`](Logger.md)

#### Returns

`EVMDiscoveryService`

## Methods

### cleanup()

> **cleanup**(): `void`

Cleanup listeners

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

> **discover**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EVMDiscoveryResults`](../interfaces/EVMDiscoveryResults.md)\>

Start discovery of EVM wallets

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`EVMDiscoveryResults`](../interfaces/EVMDiscoveryResults.md)\>

***

### getAllWallets()

> **getAllWallets**(`results?`): [`DiscoveredEVMWallet`](../interfaces/DiscoveredEVMWallet.md)[]

Get all discovered wallets (alias for tests)

#### Parameters

##### results?

[`EVMDiscoveryResults`](../interfaces/EVMDiscoveryResults.md)

#### Returns

[`DiscoveredEVMWallet`](../interfaces/DiscoveredEVMWallet.md)[]

***

### getDiscoveredWallets()

> **getDiscoveredWallets**(): [`DiscoveredEVMWallet`](../interfaces/DiscoveredEVMWallet.md)[]

Get all discovered wallets

#### Returns

[`DiscoveredEVMWallet`](../interfaces/DiscoveredEVMWallet.md)[]

***

### getWalletById()

> **getWalletById**(`id`): `undefined` \| [`DiscoveredEVMWallet`](../interfaces/DiscoveredEVMWallet.md)

Get a specific wallet by ID

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`DiscoveredEVMWallet`](../interfaces/DiscoveredEVMWallet.md)
