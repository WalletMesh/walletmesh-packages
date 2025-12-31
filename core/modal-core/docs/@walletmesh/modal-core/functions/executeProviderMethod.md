[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / executeProviderMethod

# Function: executeProviderMethod()

> **executeProviderMethod**\<`T`\>(`provider`, `options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ProviderQueryResult`](../interfaces/ProviderQueryResult.md)\<`T`\>\>

Execute a provider method across different blockchain types

This function provides a unified interface for executing RPC methods
on different blockchain providers (EVM, Solana, Aztec). It handles
the differences in provider interfaces and method calling conventions.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### provider

`unknown`

The blockchain provider instance

### options

[`ProviderQueryOptions`](../interfaces/ProviderQueryOptions.md)

Query options including method and params

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ProviderQueryResult`](../interfaces/ProviderQueryResult.md)\<`T`\>\>

Promise resolving to the query result

## Examples

```typescript
// EVM provider - get block number
const result = await executeProviderMethod(provider, {
  method: 'eth_blockNumber',
  chainType: ChainType.Evm
});
console.log('Block:', parseInt(result.data as string, 16));
```

```typescript
// Solana provider - get balance
const result = await executeProviderMethod(provider, {
  method: 'getBalance',
  params: [publicKey],
  chainType: ChainType.Solana
});
console.log('Balance:', result.data);
```

## Throws

If provider is null or method execution fails
