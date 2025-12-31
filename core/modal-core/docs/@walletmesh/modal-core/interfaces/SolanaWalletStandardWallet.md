[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SolanaWalletStandardWallet

# Interface: SolanaWalletStandardWallet

Solana Wallet Standard Wallet
As defined in the Solana Wallet Standard specification

## Properties

### accounts

> **accounts**: [`SolanaWalletAccount`](SolanaWalletAccount.md)[]

Connected accounts

***

### chains

> **chains**: `string`[]

Supported chains

***

### features

> **features**: `Record`\<`string`, `unknown`\>

Wallet features

***

### icon

> **icon**: `string`

Wallet icon as data URI or URL

***

### name

> **name**: `string`

Wallet name

## Methods

### connect()

> **connect**(`options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SolanaWalletAccount`](SolanaWalletAccount.md)[]\>

Connect to the wallet

#### Parameters

##### options?

[`SolanaConnectOptions`](SolanaConnectOptions.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SolanaWalletAccount`](SolanaWalletAccount.md)[]\>

***

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from the wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
