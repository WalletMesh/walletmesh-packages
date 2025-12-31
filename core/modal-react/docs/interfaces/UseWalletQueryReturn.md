[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseWalletQueryReturn

# Interface: UseWalletQueryReturn\<TData\>

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L51)

Wallet query return type

## Type Parameters

### TData

`TData` = `unknown`

## Properties

### data

> **data**: `undefined` \| `TData`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L53)

Query result data

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L63)

Error if any

***

### isError

> **isError**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L61)

Whether the query has errored

***

### isFetching

> **isFetching**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L57)

Whether the query is fetching (includes background refetches)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L55)

Whether the query is loading

***

### isRefetching

> **isRefetching**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L59)

Whether the query is refetching

***

### refetch()

> **refetch**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletQuery.ts#L65)

Refetch the query

#### Returns

`Promise`\<`void`\>
