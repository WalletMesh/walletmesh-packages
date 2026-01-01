[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / GasEstimationResult

# Interface: GasEstimationResult

Gas estimation result for EVM transactions.

Provides estimated gas costs using EIP-1559 pricing.
All values are returned as strings to safely handle large numbers.

## Remarks

- `gasLimit` includes a safety buffer (configured via gasMultiplier)
- `maxFeePerGas` and `maxPriorityFeePerGas` will be present for EIP-1559 chains
- `estimatedCost` is calculated as gasLimit * price for quick reference
- Values are in wei unless otherwise specified

## Example

```typescript
// Estimate gas for a transaction
const estimation = await txService.estimateGas({
  to: '0x...',
  value: '1000000000000000000',
  data: '0x...'
}, provider);

console.log(`Gas limit: ${estimation.gasLimit}`);
console.log(`Estimated cost: ${estimation.estimatedCost} wei`);

// EIP-1559 transaction
console.log(`Max fee: ${estimation.maxFeePerGas} wei`);
console.log(`Priority fee: ${estimation.maxPriorityFeePerGas} wei`);

// Convert to more readable units
const costInEth = Number(estimation.estimatedCost) / 1e18;
console.log(`Estimated cost: ${costInEth} ETH`);
```

## Properties

### estimatedCost

> **estimatedCost**: `string`

Total estimated cost in wei (gasLimit * price)

***

### gasLimit

> **gasLimit**: `string`

Estimated gas limit with safety buffer applied (in gas units)

***

### maxFeePerGas?

> `optional` **maxFeePerGas**: `string`

Maximum total fee per gas in wei (EIP-1559)

***

### maxPriorityFeePerGas?

> `optional` **maxPriorityFeePerGas**: `string`

Maximum priority fee per gas in wei (EIP-1559)
