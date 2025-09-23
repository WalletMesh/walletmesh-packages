[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useBalance

# Function: useBalance()

> **useBalance**(`options`): [`UseBalanceReturn`](../interfaces/UseBalanceReturn.md)

Defined in: [core/modal-react/src/hooks/useBalance.ts:206](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useBalance.ts#L206)

Hook for querying wallet balances

Provides balance queries with automatic caching and optional token support.
Uses TanStack Query for efficient data fetching and caching.

## Parameters

### options

[`UseBalanceOptions`](../interfaces/UseBalanceOptions.md) = `{}`

Balance query options

## Returns

[`UseBalanceReturn`](../interfaces/UseBalanceReturn.md)

Balance query result

## Since

1.0.0

## See

 - [useAccount](useAccount.md) - For getting the connected address
 - [useSwitchChain](useSwitchChain.md) - For getting the current chain
 - [useTransaction](useTransaction.md) - For sending transactions

## Remarks

This hook automatically handles:
- Native and token balance queries
- Multi-chain balance fetching
- Automatic refetching on address/chain changes
- Caching with TanStack Query
- Real-time updates via polling
- Error handling and retry logic

The balance is returned in the smallest unit (wei for ETH, lamports for SOL).
Use the formatted property for human-readable values.

Performance considerations:
- Enable watch only when real-time updates are needed
- Adjust watchInterval based on your requirements
- TanStack Query handles caching automatically

## Examples

```tsx
// Query native balance for connected account
function MyComponent() {
  const { data: balance, isLoading } = useBalance();

  if (isLoading) return <div>Loading balance...</div>;
  if (!balance) return <div>No balance data</div>;

  return <div>{balance.formatted} {balance.symbol}</div>;
}
```

```tsx
// Query token balance with watching
function TokenBalance() {
  const { data: balance } = useBalance({
    token: {
      address: '0x...',
      symbol: 'USDC',
      decimals: 6
    },
    watch: true,
    watchInterval: 10000 // 10 seconds
  });

  return <div>{balance?.formatted || '0'} USDC</div>;
}
```

```tsx
// Query balance on specific chain
function CrossChainBalance() {
  // const [address, setAddress] = useState('0x...'); // useState imported from react
  const address = '0x...'; // Example address
  const { data: balance } = useBalance({
    address,
    chain: { chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' }, // Polygon
    enabled: !!address
  });

  return <div>Polygon balance: {balance?.formatted}</div>;
}
```

```tsx
// Handle loading and error states
function BalanceWithStates() {
  const { data, isLoading, isError, error, refetch, invalidate } = useBalance({
    watch: true,
    watchInterval: 30000 // 30 seconds
  });

  if (isLoading) return <div>Loading balance...</div>;
  if (isError) return (
    <div>
      Error: {error?.message}
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );

  return (
    <div>
      <p>{data?.formatted} {data?.symbol}</p>
      <p>Raw: {data?.value}</p>
      <button onClick={() => invalidate()}>Refresh</button>
    </div>
  );
}
```
