[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransactionManager

# Interface: TransactionManager

Multi-wallet transaction manager interface

## Methods

### executeWithContext()

> **executeWithContext**\<`T`\>(`request`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionResult`](../../../internal/types/typedocExports/interfaces/TransactionResult.md)\<`T`\>\>

Execute a transaction with explicit context

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### request

[`SafeTransactionRequest`](SafeTransactionRequest.md)\<`T`\>

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionResult`](../../../internal/types/typedocExports/interfaces/TransactionResult.md)\<`T`\>\>

#### Throws

If wallet not connected or chain not supported

***

### getBestWalletForChain()

> **getBestWalletForChain**(`chain`): `null` \| `string`

Get the best wallet for a given chain

#### Parameters

##### chain

###### chainId

`string` = `caip2Schema`

Chain identifier in CAIP-2 format

###### chainType

[`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

###### group?

`string` = `...`

Grouping identifier for multi-chain scenarios

###### icon?

`string` = `...`

Optional icon URL for the chain

###### interfaces?

`string`[] = `...`

List of required provider interfaces for this chain

###### label?

`string` = `...`

Display label for the chain (optional override of name)

###### name

`string` = `...`

Human-readable name of the chain

###### required

`boolean` = `...`

Whether this chain is required for the dApp to function

#### Returns

`null` \| `string`

***

### getWalletsForChain()

> **getWalletsForChain**(`chain`): `string`[]

Get all wallets that support a given chain

#### Parameters

##### chain

###### chainId

`string` = `caip2Schema`

Chain identifier in CAIP-2 format

###### chainType

[`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

###### group?

`string` = `...`

Grouping identifier for multi-chain scenarios

###### icon?

`string` = `...`

Optional icon URL for the chain

###### interfaces?

`string`[] = `...`

List of required provider interfaces for this chain

###### label?

`string` = `...`

Display label for the chain (optional override of name)

###### name

`string` = `...`

Human-readable name of the chain

###### required

`boolean` = `...`

Whether this chain is required for the dApp to function

#### Returns

`string`[]

***

### validateContext()

> **validateContext**(`context`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `reason?`: `string`; `suggestedAction?`: `"connect-wallet"` \| `"switch-chain"` \| `"switch-wallet"`; `valid`: `boolean`; \}\>

Validate that a transaction can be executed

#### Parameters

##### context

[`TransactionContext`](TransactionContext.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `reason?`: `string`; `suggestedAction?`: `"connect-wallet"` \| `"switch-chain"` \| `"switch-wallet"`; `valid`: `boolean`; \}\>
