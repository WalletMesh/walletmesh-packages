[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseWalletQueryOptions

# Interface: UseWalletQueryOptions\<TData\>

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L27)

Options for wallet queries

## Type Parameters

### TData

`TData` = `unknown`

## Properties

### cacheTime?

> `optional` **cacheTime**: `number`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L39)

Cache time in milliseconds (default: 5 minutes)

***

### chain?

> `optional` **chain**: `object`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L33)

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

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L35)

Whether to enable the query (default: true)

***

### method

> **method**: `string`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L29)

RPC method to call

***

### params?

> `optional` **params**: `unknown`[]

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L31)

Parameters for the RPC method

***

### queryOptions?

> `optional` **queryOptions**: `Omit`\<`UseQueryOptions`\<`TData`, `Error`, `TData`, readonly `unknown`[]\>, `"enabled"` \| `"queryKey"` \| `"queryFn"`\>

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L43)

Custom TanStack Query options

***

### refetchInterval?

> `optional` **refetchInterval**: `number` \| `false`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L41)

Refetch interval in milliseconds

***

### staleTime?

> `optional` **staleTime**: `number`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L37)

Stale time in milliseconds (data considered fresh within this time)
