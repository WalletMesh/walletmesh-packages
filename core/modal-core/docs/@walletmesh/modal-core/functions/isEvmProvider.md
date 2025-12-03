[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isEvmProvider

# Function: isEvmProvider()

> **isEvmProvider**(`provider`): provider is \{ request: (args: \{ method: string; params?: unknown\[\] \| Record\<string, unknown\> \}) =\> Promise\<unknown\> \}

Type guard to check if a provider is an EVM provider

EVM providers follow the EIP-1193 standard and have a request() method
for sending JSON-RPC requests to the wallet. This is the natural interface
for Ethereum and EVM-compatible chains.

## Parameters

### provider

`unknown`

The provider to check

## Returns

provider is \{ request: (args: \{ method: string; params?: unknown\[\] \| Record\<string, unknown\> \}) =\> Promise\<unknown\> \}

True if provider has the EVM provider interface

## Example

```typescript
// Use provider-specific methods based on type
if (isEvmProvider(provider)) {
  // Safe to use EIP-1193 request method
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  const chainId = await provider.request({ method: 'eth_chainId' });
} else if (isSolanaProvider(provider)) {
  // Use Solana-specific methods
  const connection = await provider.connect();
  const signature = await provider.signTransaction(transaction);
}
```
