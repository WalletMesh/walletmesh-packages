[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseBalanceOptions

# Interface: UseBalanceOptions

Defined in: [core/modal-react/src/hooks/useBalance.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L55)

Balance query options

## Properties

### address?

> `optional` **address**: `string`

Defined in: [core/modal-react/src/hooks/useBalance.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L57)

Address to query balance for (defaults to connected address)

***

### cacheTime?

> `optional` **cacheTime**: `number`

Defined in: [core/modal-react/src/hooks/useBalance.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L71)

Cache time in milliseconds (default: 5 minutes)

***

### chain?

> `optional` **chain**: `object`

Defined in: [core/modal-react/src/hooks/useBalance.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L59)

Chain to query on (defaults to current chain)

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: [core/modal-react/src/hooks/useBalance.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L67)

Whether to enable the query (default: true)

***

### formatUnits?

> `optional` **formatUnits**: `string`

Defined in: [core/modal-react/src/hooks/useBalance.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L69)

Format units (e.g., 'ether', 'gwei') - chain specific

***

### staleTime?

> `optional` **staleTime**: `number`

Defined in: [core/modal-react/src/hooks/useBalance.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L73)

Stale time in milliseconds (data considered fresh within this time)

***

### token?

> `optional` **token**: [`TokenInfo`](TokenInfo.md)

Defined in: [core/modal-react/src/hooks/useBalance.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L61)

Token information for token balance queries (omit for native balance)

***

### watch?

> `optional` **watch**: `boolean`

Defined in: [core/modal-react/src/hooks/useBalance.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L63)

Whether to watch for balance changes (default: false)

***

### watchInterval?

> `optional` **watchInterval**: `number`

Defined in: [core/modal-react/src/hooks/useBalance.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useBalance.ts#L65)

Polling interval in milliseconds (default: 4000, only used if watch is true)
