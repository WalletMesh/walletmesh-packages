[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / buildTransactionSummaryForSingle

# Function: buildTransactionSummaryForSingle()

> **buildTransactionSummaryForSingle**(`executionPayload`): `undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Defined in: [middlewares/transactionSummaryMiddleware.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/transactionSummaryMiddleware.ts#L69)

Builds a transaction summary from a single execution payload.
This is a helper function that can be used in router-level middleware.

## Parameters

### executionPayload

Single execution payload containing calls

`undefined` | `ExecutionPayload`

## Returns

`undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Transaction summary with function calls
