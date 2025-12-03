[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AdapterEvents

# Type Alias: AdapterEvents

> **AdapterEvents** = `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:113

Type-safe event system

## Properties

### accounts:changed

> **accounts:changed**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:121

#### accounts

> **accounts**: `string`[]

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### chain:changed

> **chain:changed**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:125

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### connection:established

> **connection:established**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:114

#### connection

> **connection**: [`WalletConnection`](../interfaces/WalletConnection.md)

***

### connection:lost

> **connection:lost**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:117

#### error?

> `optional` **error**: [`ModalError`](ModalError.md)

#### reason

> **reason**: `string`

***

### error

> **error**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:129

#### error

> **error**: [`ModalError`](ModalError.md)

#### operation

> **operation**: `string`

***

### state:changed

> **state:changed**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:133

#### state

> **state**: [`WalletAdapterConnectionState`](../interfaces/WalletAdapterConnectionState.md)

***

### wallet:accountsChanged

> **wallet:accountsChanged**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:136

#### accounts

> **accounts**: `string`[]

#### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### wallet:chainChanged

> **wallet:chainChanged**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:140

#### chainId

> **chainId**: `string`

#### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### wallet:connected

> **wallet:connected**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:144

#### connection

> **connection**: [`WalletConnection`](../interfaces/WalletConnection.md)

***

### wallet:disconnected

> **wallet:disconnected**: `object`

Defined in: core/modal-core/dist/internal/wallets/base/WalletAdapter.d.ts:147

#### reason?

> `optional` **reason**: `string`
