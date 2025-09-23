[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletCapabilities

# Interface: WalletCapabilities

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:22

Defines what a wallet supports

## Properties

### chains

> **chains**: [`ChainDefinition`](ChainDefinition.md)[]

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:24

Supported blockchain types and their chain IDs

***

### features

> **features**: `Set`\<[`WalletFeature`](../type-aliases/WalletFeature.md)\>

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:26

Set of features this wallet supports

***

### permissions?

> `optional` **permissions**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:28

Permissions this wallet requires/supports

#### events

> **events**: `string`[]

Events the wallet can emit

#### methods

> **methods**: `string`[]

Methods the wallet can execute
