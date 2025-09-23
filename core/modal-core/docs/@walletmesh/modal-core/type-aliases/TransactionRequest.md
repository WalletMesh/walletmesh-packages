[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransactionRequest

# Type Alias: TransactionRequest\<T\>

> **TransactionRequest**\<`T`\> = `T` *extends* `"evm"` ? [`EVMTransactionParams`](../interfaces/EVMTransactionParams.md) : `T` *extends* `"solana"` ? [`SolanaTransactionParams`](../interfaces/SolanaTransactionParams.md) : `T` *extends* `"aztec"` ? [`AztecTransactionParams`](../interfaces/AztecTransactionParams.md) : [`BaseTransactionParams`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md)

Transaction request type that maps chain types to their specific parameter interfaces.

This conditional type ensures type safety by providing the correct transaction
parameter interface based on the chain type specified.

## Type Parameters

### T

`T` *extends* [`ChainType`](../enumerations/ChainType.md) = [`ChainType`](../enumerations/ChainType.md)

The chain type ('evm', 'solana', 'aztec', or generic)

## Example

```typescript
// Type is automatically inferred based on chain type
function sendTransaction<T extends ChainType>(
  chainType: T,
  params: TransactionRequest<T>
) {
  // params will have the correct type based on chainType
}

// EVM transaction
sendTransaction('evm', {
  to: '0x...',
  value: '1000000000000000000'
}); // params is EVMTransactionParams

// Solana transaction
sendTransaction('solana', {
  transaction: 'base64...'
}); // params is SolanaTransactionParams
```
