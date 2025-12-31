[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isAztecRouterProvider

# Function: isAztecRouterProvider()

> **isAztecRouterProvider**(`provider`): `provider is { call: (request: { method: string; params?: unknown[] }) => Promise<unknown>; connect: () => Promise<{ permissions: Record<string, string[]>; sessionId: string }>; disconnect: () => Promise<void> }`

Type guard to check if a provider is an Aztec router provider

Aztec providers use the WalletRouterProvider pattern with a call() method
instead of the EIP-1193 request() pattern. This allows for more flexible
routing and privacy-preserving communication patterns.

## Parameters

### provider

`unknown`

The provider to check

## Returns

`provider is { call: (request: { method: string; params?: unknown[] }) => Promise<unknown>; connect: () => Promise<{ permissions: Record<string, string[]>; sessionId: string }>; disconnect: () => Promise<void> }`

True if provider has the Aztec router provider interface

## Example

```typescript
if (isAztecRouterProvider(provider)) {
  // Use Aztec router call pattern
  const response = await provider.call({
    method: 'aztec_getAddress',
    params: []
  });

  const txHash = await provider.call({
    method: 'aztec_sendTransaction',
    params: [transactionData]
  });
}
```
