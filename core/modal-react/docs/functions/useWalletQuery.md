[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletQuery

# Function: useWalletQuery()

> **useWalletQuery**\<`TData`\>(`options`): [`UseWalletQueryReturn`](../interfaces/UseWalletQueryReturn.md)\<`TData`\>

Defined in: [core/modal-react/src/hooks/useWalletQuery.ts:165](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletQuery.ts#L165)

Hook for making generic wallet queries

Provides a flexible interface for querying data through wallet providers
using TanStack Query. Supports any RPC method across EVM, Solana, and Aztec chains.

## Type Parameters

### TData

`TData` = `unknown`

## Parameters

### options

[`UseWalletQueryOptions`](../interfaces/UseWalletQueryOptions.md)\<`TData`\>

Query options including method, params, and cache configuration

## Returns

[`UseWalletQueryReturn`](../interfaces/UseWalletQueryReturn.md)\<`TData`\>

Query result with loading states and refetch capability

## Since

1.0.0

## See

 - [useAccount](useAccount.md) - For getting the connected wallet provider
 - [useBalance](useBalance.md) - Example of a specialized query hook
 - [useTransaction](useTransaction.md) - For sending transactions

## Remarks

This hook provides a generic interface for making RPC queries through the connected
wallet provider. It automatically handles:
- Caching with TanStack Query
- Loading and error states
- Automatic refetching based on configuration
- Multi-chain query support

Common use cases include:
- Fetching contract data
- Getting blockchain state
- Querying transaction receipts
- Custom RPC method calls

## Examples

```tsx
// Query current block number
import { useWalletQuery } from '@walletmesh/modal-react';

function BlockNumber() {
  const { data: blockNumber, isLoading } = useWalletQuery<string>({
    method: 'eth_blockNumber',
    staleTime: 10000 // 10 seconds
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>Current block: {parseInt(blockNumber || '0', 16)}</div>;
}
```

```tsx
// Query ERC20 token balance
function TokenBalance({ tokenAddress, userAddress }: Props) {
  const { data: balance } = useWalletQuery<string>({
    method: 'eth_call',
    params: [{
      to: tokenAddress,
      data: `0x70a08231000000000000000000000000${userAddress.slice(2)}` // balanceOf(address)
    }, 'latest'],
    enabled: !!tokenAddress && !!userAddress
  });

  return <div>Token balance: {balance ? BigInt(balance).toString() : '0'}</div>;
}
```

```tsx
// Query with automatic refetching
function GasPrice() {
  const { data: gasPrice, isRefetching } = useWalletQuery<string>({
    method: 'eth_gasPrice',
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 4000 // Consider stale after 4 seconds
  });

  return (
    <div>
      Gas price: {gasPrice ? BigInt(gasPrice).toString() : 'Loading...'}
      {isRefetching && ' (updating...)'}
    </div>
  );
}
```

```tsx
// Query on specific chain
function PolygonData() {
  const { data, error } = useWalletQuery({
    method: 'eth_getBalance',
    params: ['0x742d35Cc6634C0532925a3b844Bc9e7595f6E123', 'latest'],
    chain: { chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' } // Query on Polygon
  });

  if (error) return <div>Error: {error.message}</div>;
  return <div>Balance on Polygon: {data}</div>;
}
```
