[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / buildTransactionSummaryForBatch

# Function: buildTransactionSummaryForBatch()

> **buildTransactionSummaryForBatch**(`executionPayloads`): `undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Defined in: [middlewares/transactionSummaryMiddleware.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/transactionSummaryMiddleware.ts#L34)

Builds a transaction summary from an array of execution payloads (batch execute).
This is a helper function that can be used in router-level middleware.

## Parameters

### executionPayloads

Array of execution payloads containing calls

`undefined` | `ExecutionPayload`[]

## Returns

`undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Transaction summary with all function calls
