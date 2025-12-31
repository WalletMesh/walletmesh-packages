[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransactionCallbacks

# Interface: TransactionCallbacks

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:87

Callback functions for transaction lifecycle events

Used with async execution mode to notify application of state changes

## Properties

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:97

Called when transaction fails at any stage

#### Parameters

##### error

`Error`

Error that caused the failure

#### Returns

`void`

***

### onStatusChange()?

> `optional` **onStatusChange**: (`status`, `result`) => `void`

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:103

Called on every status change during transaction lifecycle

#### Parameters

##### status

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

New transaction status

##### result

[`AztecTransactionResult`](AztecTransactionResult.md)

Current transaction state

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`result`) => `void`

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:92

Called when transaction is successfully confirmed

#### Parameters

##### result

[`AztecTransactionResult`](AztecTransactionResult.md)

Final transaction result with receipt

#### Returns

`void`
