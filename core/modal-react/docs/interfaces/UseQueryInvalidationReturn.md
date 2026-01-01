[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseQueryInvalidationReturn

# Interface: UseQueryInvalidationReturn

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L32)

Hook return type for query invalidation utilities

## Properties

### invalidateAll()

> **invalidateAll**: (`options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L34)

Invalidate all WalletMesh queries

#### Parameters

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateBalance()

> **invalidateBalance**: (`chain`, `address`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L40)

Invalidate balance for specific address and chain

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### address

`string`

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateBalances()

> **invalidateBalances**: (`options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L37)

Invalidate all balance queries

#### Parameters

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateChain()

> **invalidateChain**: (`chain`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L86)

Invalidate specific chain

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateChains()

> **invalidateChains**: (`options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L83)

Invalidate all chain queries

#### Parameters

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateContract()

> **invalidateContract**: (`chain`, `address`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L64)

Invalidate specific contract

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### address

`string`

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateContractMethod()

> **invalidateContractMethod**: (`chain`, `address`, `methodSig`, `params?`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L71)

Invalidate contract method calls

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### address

`string`

##### methodSig

`string`

##### params?

readonly `unknown`[]

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateContracts()

> **invalidateContracts**: (`options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L61)

Invalidate all contract queries

#### Parameters

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateContractsByChain()

> **invalidateContractsByChain**: (`chain`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L80)

Invalidate all contracts on a chain

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateCustom()

> **invalidateCustom**: (`queryKey`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L89)

Invalidate custom query pattern

#### Parameters

##### queryKey

readonly `unknown`[]

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateTokenBalance()

> **invalidateTokenBalance**: (`chain`, `address`, `tokenAddress`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L43)

Invalidate token balance for specific token

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### address

`string`

##### tokenAddress

`string`

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateTransaction()

> **invalidateTransaction**: (`chain`, `hash`, `options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L54)

Invalidate specific transaction

#### Parameters

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

##### hash

`string`

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidateTransactions()

> **invalidateTransactions**: (`options?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useQueryInvalidation.ts#L51)

Invalidate all transaction queries

#### Parameters

##### options?

[`InvalidationOptions`](InvalidationOptions.md)

#### Returns

`Promise`\<`void`\>
