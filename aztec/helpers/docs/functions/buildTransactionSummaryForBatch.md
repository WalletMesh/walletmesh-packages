[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / buildTransactionSummaryForBatch

# Function: buildTransactionSummaryForBatch()

> **buildTransactionSummaryForBatch**(`executionPayloads`): `undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Defined in: [middlewares/transactionSummaryMiddleware.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/middlewares/transactionSummaryMiddleware.ts#L34)

Builds a transaction summary from an array of execution payloads (batch execute).
This is a helper function that can be used in router-level middleware.

## Parameters

### executionPayloads

Array of execution payloads containing calls

`undefined` | `ExecutionPayload`[]

## Returns

`undefined` \| [`TransactionSummary`](../interfaces/TransactionSummary.md)

Transaction summary with all function calls
