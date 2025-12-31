[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseBalanceReturn

# Interface: UseBalanceReturn

Defined in: [core/modal-react/src/hooks/useBalance.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L81)

Balance query return type

## Properties

### data

> **data**: `undefined` \| [`BalanceInfo`](BalanceInfo.md)

Defined in: [core/modal-react/src/hooks/useBalance.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L83)

Balance data

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useBalance.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L93)

Error if any

***

### invalidate()

> **invalidate**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useBalance.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L97)

Invalidate the balance cache

#### Returns

`Promise`\<`void`\>

***

### isError

> **isError**: `boolean`

Defined in: [core/modal-react/src/hooks/useBalance.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L91)

Whether the query has errored

***

### isFetching

> **isFetching**: `boolean`

Defined in: [core/modal-react/src/hooks/useBalance.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L87)

Whether the query is fetching (includes background refetches)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useBalance.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L85)

Whether the query is loading

***

### isRefetching

> **isRefetching**: `boolean`

Defined in: [core/modal-react/src/hooks/useBalance.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L89)

Whether the query is refetching

***

### refetch()

> **refetch**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useBalance.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useBalance.ts#L95)

Refetch the balance

#### Returns

`Promise`\<`void`\>
