[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecTransactionResult

# Interface: AztecTransactionResult

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:55

Extended transaction result with Aztec lifecycle tracking

Extends the base TransactionResult with additional fields for:
- Execution mode (sync vs async)
- Detailed stage timing information
- Callback functions for lifecycle events
- Signing-only operation flag

## Extends

- [`CoreTransactionResult`](CoreTransactionResult.md)

## Properties

### blockHash?

> `optional` **blockHash**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:549

Hash of the block containing the transaction.
Copied from receipt for convenience.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`blockHash`](CoreTransactionResult.md#blockhash)

***

### blockNumber?

> `optional` **blockNumber**: `number`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:544

Block number where transaction was included.
Copied from receipt for convenience.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`blockNumber`](CoreTransactionResult.md#blocknumber)

***

### chainId

> **chainId**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:494

Chain ID where the transaction was sent.
Matches the connected chain at time of sending.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`chainId`](CoreTransactionResult.md#chainid)

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: core/modal-core/dist/services/transaction/types.d.ts:499

Type of blockchain (evm, solana, aztec).
Determines how the transaction is processed.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`chainType`](CoreTransactionResult.md#chaintype)

***

### effectiveGasPrice?

> `optional` **effectiveGasPrice**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:559

Actual gas price paid (EVM with EIP-1559).
Copied from receipt for convenience.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`effectiveGasPrice`](CoreTransactionResult.md#effectivegasprice)

***

### endTime?

> `optional` **endTime**: `number`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:539

Unix timestamp when transaction completed.
Set when status becomes 'confirmed' or 'failed'.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`endTime`](CoreTransactionResult.md#endtime)

***

### error?

> `optional` **error**: `object`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:529

Error details if transaction failed.
Includes stage and error message.

#### category

> **category**: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`

#### cause?

> `optional` **cause**: `unknown`

#### classification?

> `optional` **classification**: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

#### code

> **code**: `string`

#### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

#### maxRetries?

> `optional` **maxRetries**: `number`

#### message

> **message**: `string`

#### recoveryStrategy?

> `optional` **recoveryStrategy**: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`

#### retryDelay?

> `optional` **retryDelay**: `number`

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`error`](CoreTransactionResult.md#error)

***

### from

> **from**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:514

Address that sent the transaction.
The connected wallet's active address.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`from`](CoreTransactionResult.md#from)

***

### gasUsed?

> `optional` **gasUsed**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:554

Gas consumed by the transaction (EVM only).
Copied from receipt for convenience.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`gasUsed`](CoreTransactionResult.md#gasused)

***

### isSigningOnly?

> `optional` **isSigningOnly**: `boolean`

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:72

Flag indicating if this is a signing-only operation (authwit, sign message, etc.)
Signing-only operations should never trigger the transaction status overlay
as they don't involve blockchain state changes or multi-stage execution

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/services/transaction/types.d.ts:564

Application-specific metadata.
Custom data passed in transaction request.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`metadata`](CoreTransactionResult.md#metadata)

***

### mode

> **mode**: `TransactionMode`

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:61

Execution mode for this transaction
- sync: User waits with overlay, transaction blocks UI
- async: Transaction runs in background, user can continue

***

### receipt?

> `optional` **receipt**: `TransactionReceipt`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:524

Transaction receipt after confirmation.
Only available when status is 'confirmed'.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`receipt`](CoreTransactionResult.md#receipt)

***

### request

> **request**: [`EVMTransactionParams`](EVMTransactionParams.md) \| [`SolanaTransactionParams`](SolanaTransactionParams.md) \| `AztecTransactionParams`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:519

Original transaction request parameters.
Preserves the input for reference.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`request`](CoreTransactionResult.md#request)

***

### stages

> **stages**: `TransactionStages`

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:66

Detailed timing information for each lifecycle stage
Used for performance monitoring and progress display

***

### startTime

> **startTime**: `number`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:534

Unix timestamp when transaction started.
Useful for calculating transaction duration.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`startTime`](CoreTransactionResult.md#starttime)

***

### status

> **status**: [`TransactionStatus`](../type-aliases/TransactionStatus.md)

Defined in: core/modal-core/dist/services/transaction/types.d.ts:509

Current status of the transaction.
Updates as transaction progresses through lifecycle.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`status`](CoreTransactionResult.md#status)

***

### txHash

> **txHash**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:489

Blockchain transaction hash/signature.

The actual identifier on the blockchain, available after the transaction
has been successfully broadcast to the network. This is the permanent,
on-chain identifier that can be used to look up the transaction.

#### Remarks

Available after transaction is broadcast (status >= 'broadcasting').
Use this for blockchain explorers and on-chain lookups.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`txHash`](CoreTransactionResult.md#txhash)

***

### txStatusId

> **txStatusId**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:477

Internal status tracking ID for coordinating notifications between backend and frontend.

Generated by the frontend, passed to backend to ensure status notifications
can be matched to the correct transaction in the UI. This is NOT the blockchain
transaction hash - see `txHash` for the on-chain identifier.

#### Remarks

Unique per session, not persisted, not sent to blockchain.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`txStatusId`](CoreTransactionResult.md#txstatusid)

***

### wait()

> **wait**: (`confirmations?`) => `Promise`\<`TransactionReceipt`\>

Defined in: core/modal-core/dist/services/transaction/types.d.ts:573

Wait for transaction confirmation.
Returns a promise that resolves with the receipt when confirmed.

#### Parameters

##### confirmations?

`number`

Number of block confirmations to wait for (default: 1)

#### Returns

`Promise`\<`TransactionReceipt`\>

Promise resolving to the transaction receipt

#### Throws

TransactionError if the transaction fails or times out

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`wait`](CoreTransactionResult.md#wait)

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:504

ID of the wallet that sent the transaction.
Useful for multi-wallet applications.

#### Inherited from

[`CoreTransactionResult`](CoreTransactionResult.md).[`walletId`](CoreTransactionResult.md#walletid)

***

### walletTxStatusId?

> `optional` **walletTxStatusId**: `string`

Defined in: core/modal-core/dist/state/types/aztecTransactions.d.ts:80

The wallet's internal transaction status ID.
When a placeholder transaction is created before the wallet call,
the wallet will send notifications with its own txStatusId.
This field maps the wallet's ID to our placeholder ID, allowing
subsequent notifications to update the correct transaction.
