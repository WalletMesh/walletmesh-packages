[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AztecTransactionResult

# Interface: AztecTransactionResult

Extended transaction result with Aztec lifecycle tracking

Extends the base TransactionResult with additional fields for:
- Execution mode (sync vs async)
- Detailed stage timing information
- Callback functions for lifecycle events
- Signing-only operation flag

## Extends

- [`TransactionResult`](TransactionResult.md)

## Properties

### blockHash?

> `optional` **blockHash**: `string`

Hash of the block containing the transaction.
Copied from receipt for convenience.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`blockHash`](TransactionResult.md#blockhash)

***

### blockNumber?

> `optional` **blockNumber**: `number`

Block number where transaction was included.
Copied from receipt for convenience.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`blockNumber`](TransactionResult.md#blocknumber)

***

### chainId

> **chainId**: `string`

Chain ID where the transaction was sent.
Matches the connected chain at time of sending.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`chainId`](TransactionResult.md#chainid)

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Type of blockchain (evm, solana, aztec).
Determines how the transaction is processed.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`chainType`](TransactionResult.md#chaintype)

***

### effectiveGasPrice?

> `optional` **effectiveGasPrice**: `string`

Actual gas price paid (EVM with EIP-1559).
Copied from receipt for convenience.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`effectiveGasPrice`](TransactionResult.md#effectivegasprice)

***

### endTime?

> `optional` **endTime**: `number`

Unix timestamp when transaction completed.
Set when status becomes 'confirmed' or 'failed'.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`endTime`](TransactionResult.md#endtime)

***

### error?

> `optional` **error**: `object`

Error details if transaction failed.
Includes stage and error message.

#### category

> **category**: `"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

#### cause?

> `optional` **cause**: `unknown`

Underlying cause of the error

#### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

Error classification for recovery purposes

#### code

> **code**: `string`

Error code identifier

#### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Additional error data

#### maxRetries?

> `optional` **maxRetries**: `number`

Maximum number of retry attempts

#### message

> **message**: `string`

Human-readable error message

#### recoveryStrategy?

> `optional` **recoveryStrategy**: `"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

#### retryDelay?

> `optional` **retryDelay**: `number`

Retry delay in milliseconds (for retry strategies)

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`error`](TransactionResult.md#error)

***

### from

> **from**: `string`

Address that sent the transaction.
The connected wallet's active address.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`from`](TransactionResult.md#from)

***

### gasUsed?

> `optional` **gasUsed**: `string`

Gas consumed by the transaction (EVM only).
Copied from receipt for convenience.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`gasUsed`](TransactionResult.md#gasused)

***

### isSigningOnly?

> `optional` **isSigningOnly**: `boolean`

Flag indicating if this is a signing-only operation (authwit, sign message, etc.)
Signing-only operations should never trigger the transaction status overlay
as they don't involve blockchain state changes or multi-stage execution

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Application-specific metadata.
Custom data passed in transaction request.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`metadata`](TransactionResult.md#metadata)

***

### mode

> **mode**: [`TransactionMode`](../type-aliases/TransactionMode.md)

Execution mode for this transaction
- sync: User waits with overlay, transaction blocks UI
- async: Transaction runs in background, user can continue

***

### receipt?

> `optional` **receipt**: [`TransactionServiceReceipt`](../../../internal/types/typedocExports/interfaces/TransactionServiceReceipt.md)

Transaction receipt after confirmation.
Only available when status is 'confirmed'.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`receipt`](TransactionResult.md#receipt)

***

### request

> **request**: [`EVMTransactionParams`](EVMTransactionParams.md) \| [`SolanaTransactionParams`](SolanaTransactionParams.md) \| [`AztecTransactionParams`](AztecTransactionParams.md)

Original transaction request parameters.
Preserves the input for reference.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`request`](TransactionResult.md#request)

***

### stages

> **stages**: [`TransactionStages`](TransactionStages.md)

Detailed timing information for each lifecycle stage
Used for performance monitoring and progress display

***

### startTime

> **startTime**: `number`

Unix timestamp when transaction started.
Useful for calculating transaction duration.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`startTime`](TransactionResult.md#starttime)

***

### status

> **status**: [`TransactionStatus`](../type-aliases/TransactionStatus.md)

Current status of the transaction.
Updates as transaction progresses through lifecycle.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`status`](TransactionResult.md#status)

***

### txHash

> **txHash**: `string`

Blockchain transaction hash/signature.

The actual identifier on the blockchain, available after the transaction
has been successfully broadcast to the network. This is the permanent,
on-chain identifier that can be used to look up the transaction.

#### Remarks

Available after transaction is broadcast (status >= 'broadcasting').
Use this for blockchain explorers and on-chain lookups.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`txHash`](TransactionResult.md#txhash)

***

### txStatusId

> **txStatusId**: `string`

Internal status tracking ID for coordinating notifications between backend and frontend.

Generated by the frontend, passed to backend to ensure status notifications
can be matched to the correct transaction in the UI. This is NOT the blockchain
transaction hash - see `txHash` for the on-chain identifier.

#### Remarks

Unique per session, not persisted, not sent to blockchain.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`txStatusId`](TransactionResult.md#txstatusid)

***

### wait()

> **wait**: (`confirmations?`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionServiceReceipt`](../../../internal/types/typedocExports/interfaces/TransactionServiceReceipt.md)\>

Wait for transaction confirmation.
Returns a promise that resolves with the receipt when confirmed.

#### Parameters

##### confirmations?

`number`

Number of block confirmations to wait for (default: 1)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`TransactionServiceReceipt`](../../../internal/types/typedocExports/interfaces/TransactionServiceReceipt.md)\>

Promise resolving to the transaction receipt

#### Throws

TransactionError if the transaction fails or times out

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`wait`](TransactionResult.md#wait)

***

### walletId

> **walletId**: `string`

ID of the wallet that sent the transaction.
Useful for multi-wallet applications.

#### Inherited from

[`TransactionResult`](TransactionResult.md).[`walletId`](TransactionResult.md#walletid)

***

### walletTxStatusId?

> `optional` **walletTxStatusId**: `string`

The wallet's internal transaction status ID.
When a placeholder transaction is created before the wallet call,
the wallet will send notifications with its own txStatusId.
This field maps the wallet's ID to our placeholder ID, allowing
subsequent notifications to update the correct transaction.
