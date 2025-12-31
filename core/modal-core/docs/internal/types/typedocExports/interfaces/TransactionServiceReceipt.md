[**@walletmesh/modal-core v0.0.2**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / TransactionServiceReceipt

# Interface: TransactionServiceReceipt

Transaction receipt containing confirmation details from the blockchain.

Represents the final state of a confirmed transaction, including block information,
gas usage, and execution status. The exact fields may vary by blockchain type.

## Remarks

- `status` indicates success (1/'0x1') or failure (0/'0x0')
- Gas-related fields are primarily for EVM chains
- `logs` contain events emitted during transaction execution
- Receipt is only available after transaction is mined/confirmed

## Example

```typescript
// Wait for transaction and check receipt
const result = await txService.sendTransaction(params);
const receipt = await result.wait();

if (receipt.status === '0x1' || receipt.status === 1) {
  console.log('Transaction successful!');
  console.log(`Gas used: ${receipt.gasUsed}`);
  console.log(`Block: ${receipt.blockNumber}`);

  // Process events from logs
  receipt.logs?.forEach(log => {
    console.log('Event emitted:', log);
  });
} else {
  console.error('Transaction failed!');
}
```

## Properties

### blockHash

> **blockHash**: `string`

Hash of the block containing this transaction.
Can be used to verify block inclusion.

***

### blockNumber

> **blockNumber**: `number`

Block number where the transaction was included.
Higher numbers indicate more recent blocks.

***

### cumulativeGasUsed?

> `optional` **cumulativeGasUsed**: `string`

Total gas used in the block up to this transaction (EVM).
Useful for calculating gas usage patterns.

***

### effectiveGasPrice?

> `optional` **effectiveGasPrice**: `string`

Actual gas price paid (EVM chains with EIP-1559).
May differ from original gas price due to base fee changes.

***

### from

> **from**: `string`

Address that sent the transaction.
Always present in receipts.

***

### gasUsed

> **gasUsed**: `string`

Total gas consumed by the transaction (as string).
Actual cost depends on gas price at execution time.

***

### logs?

> `optional` **logs**: `unknown`[]

Array of log entries/events emitted during execution.
Contains decoded events from smart contracts.

***

### status

> **status**: `0` \| `1` \| `"0x0"` \| `"0x1"`

Execution status of the transaction.
- 1/'0x1': Success - transaction executed without reverting
- 0/'0x0': Failure - transaction reverted

***

### to?

> `optional` **to**: `string`

Recipient address (if applicable).
May be undefined for contract creation transactions.

***

### transactionHash

> **transactionHash**: `string`

The transaction hash (0x-prefixed hex string).
Unique identifier for this transaction on the blockchain.
