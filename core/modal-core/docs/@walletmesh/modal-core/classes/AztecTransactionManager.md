[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AztecTransactionManager

# Class: AztecTransactionManager

Aztec Transaction Manager

Orchestrates transaction lifecycle with support for sync and async modes.
Integrates with state management for real-time status updates.

## Constructors

### Constructor

> **new AztecTransactionManager**(`config`): `AztecTransactionManager`

#### Parameters

##### config

[`AztecTransactionManagerConfig`](../interfaces/AztecTransactionManagerConfig.md)

#### Returns

`AztecTransactionManager`

## Methods

### executeAsync()

> **executeAsync**(`interaction`, `callbacks?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Execute transaction asynchronously (background)

This method returns immediately with the transaction status ID.
Transaction proceeds in background while user continues working.
Callbacks are invoked as transaction progresses.

#### Parameters

##### interaction

[`ContractFunctionInteraction`](../interfaces/ContractFunctionInteraction.md)

Contract function interaction from Aztec.js

##### callbacks?

[`TransactionCallbacks`](../interfaces/TransactionCallbacks.md)

Optional callbacks for lifecycle events

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Transaction status ID for tracking

***

### executeSync()

> **executeSync**(`interaction`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Execute transaction synchronously (blocking with overlay)

This method blocks until the transaction is confirmed or fails.
The UI will show a status overlay during execution.

#### Parameters

##### interaction

[`ContractFunctionInteraction`](../interfaces/ContractFunctionInteraction.md)

Contract function interaction from Aztec.js

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`unknown`\>

Transaction receipt

***

### getTransaction()

> **getTransaction**(`txStatusId`): `undefined` \| [`AztecTransactionResult`](../interfaces/AztecTransactionResult.md)

Get transaction by status tracking ID

#### Parameters

##### txStatusId

`string`

#### Returns

`undefined` \| [`AztecTransactionResult`](../interfaces/AztecTransactionResult.md)
