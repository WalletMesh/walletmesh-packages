[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransactionManager

# Interface: TransactionManager

Defined in: core/modal-core/dist/api/types/transaction.d.ts:44

Multi-wallet transaction manager interface

## Methods

### executeWithContext()

> **executeWithContext**\<`T`\>(`request`): `Promise`\<`TransactionResult`\<`T`\>\>

Defined in: core/modal-core/dist/api/types/transaction.d.ts:49

Execute a transaction with explicit context

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### request

[`SafeTransactionRequest`](SafeTransactionRequest.md)\<`T`\>

#### Returns

`Promise`\<`TransactionResult`\<`T`\>\>

#### Throws

If wallet not connected or chain not supported

***

### getBestWalletForChain()

> **getBestWalletForChain**(`chain`): `null` \| `string`

Defined in: core/modal-core/dist/api/types/transaction.d.ts:61

Get the best wallet for a given chain

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

#### Returns

`null` \| `string`

***

### getWalletsForChain()

> **getWalletsForChain**(`chain`): `string`[]

Defined in: core/modal-core/dist/api/types/transaction.d.ts:65

Get all wallets that support a given chain

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

#### Returns

`string`[]

***

### validateContext()

> **validateContext**(`context`): `Promise`\<\{ `reason?`: `string`; `suggestedAction?`: `"connect-wallet"` \| `"switch-chain"` \| `"switch-wallet"`; `valid`: `boolean`; \}\>

Defined in: core/modal-core/dist/api/types/transaction.d.ts:53

Validate that a transaction can be executed

#### Parameters

##### context

[`TransactionContext`](TransactionContext.md)

#### Returns

`Promise`\<\{ `reason?`: `string`; `suggestedAction?`: `"connect-wallet"` \| `"switch-chain"` \| `"switch-wallet"`; `valid`: `boolean`; \}\>
