[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransactionCallbacks

# Interface: TransactionCallbacks

Callback functions for transaction lifecycle events

Used with async execution mode to notify application of state changes

## Properties

### onError()?

> `optional` **onError**: (`error`) => `void`

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

Called when transaction is successfully confirmed

#### Parameters

##### result

[`AztecTransactionResult`](AztecTransactionResult.md)

Final transaction result with receipt

#### Returns

`void`
