[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / buildTransactionSummaryForSingle

# Function: buildTransactionSummaryForSingle()

> **buildTransactionSummaryForSingle**(`executionPayload`): `undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Defined in: [middlewares/transactionSummaryMiddleware.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/middlewares/transactionSummaryMiddleware.ts#L69)

Builds a transaction summary from a single execution payload.
This is a helper function that can be used in router-level middleware.

## Parameters

### executionPayload

Single execution payload containing calls

`undefined` | `ExecutionPayload`

## Returns

`undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Transaction summary with function calls
