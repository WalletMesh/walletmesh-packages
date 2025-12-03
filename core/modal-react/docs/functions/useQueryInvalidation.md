[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useQueryInvalidation

# Function: useQueryInvalidation()

> **useQueryInvalidation**(): [`UseQueryInvalidationReturn`](../interfaces/UseQueryInvalidationReturn.md)

Defined in: [core/modal-react/src/hooks/useQueryInvalidation.ts:275](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useQueryInvalidation.ts#L275)

Hook for invalidating TanStack Query caches

Provides convenient methods for invalidating query caches when wallet state changes.
Useful for refreshing data after transactions, chain switches, or wallet connections.

## Returns

[`UseQueryInvalidationReturn`](../interfaces/UseQueryInvalidationReturn.md)

Object with invalidation methods for different query types

## Since

1.0.0

## See

 - [useBalance](useBalance.md) - Balance queries that can be invalidated
 - [useTransaction](useTransaction.md) - Automatically invalidates balances after transactions
 - [useWalletQuery](useWalletQuery.md) - Generic queries that can be invalidated

## Remarks

This hook provides granular control over query cache invalidation, allowing you to:
- Invalidate all queries when wallet state changes significantly
- Invalidate specific query types (balances, transactions, etc.)
- Invalidate queries for specific addresses or chains
- Control refetch behavior after invalidation

Query invalidation is useful for:
- Refreshing balances after transactions
- Updating data after chain switches
- Clearing stale data after wallet disconnection
- Forcing fresh data fetches

## Examples

```tsx
// Invalidate all queries after wallet connection
import { useQueryInvalidation, useConnect } from '@walletmesh/modal-react';

function ConnectButton() {
  const { connect } = useConnect();
  const { invalidateAll } = useQueryInvalidation();

  const handleConnect = async () => {
    await connect();
    // Refresh all cached data for the new wallet
    await invalidateAll();
  };

  return <button onClick={handleConnect}>Connect & Refresh</button>;
}
```

```tsx
// Invalidate balances after transaction
import { useQueryInvalidation, useTransaction } from '@walletmesh/modal-react';

function SendTransaction() {
  const { sendTransaction } = useTransaction();
  const { invalidateBalances } = useQueryInvalidation();

  const handleSend = async () => {
    const tx = await sendTransaction({
      to: '0x...',
      value: '1000000000000000000'
    });

    // Wait for confirmation
    await tx.wait();

    // Refresh all balance queries
    await invalidateBalances();
  };

  return <button onClick={handleSend}>Send & Refresh</button>;
}
```

```tsx
// Selective invalidation for specific address
import { useQueryInvalidation, useAccount } from '@walletmesh/modal-react';

function RefreshMyBalance() {
  const { address, chain } = useAccount();
  const { invalidateBalance } = useQueryInvalidation();

  const handleRefresh = async () => {
    if (address && chain) {
      // Only refresh balance for current address/chain
      await invalidateBalance(chain, address);
    }
  };

  return <button onClick={handleRefresh}>Refresh My Balance</button>;
}
```

```tsx
// Invalidate queries after chain switch
import { useQueryInvalidation, useSwitchChain } from '@walletmesh/modal-react';

function ChainSwitcher() {
  const { switchChain } = useSwitchChain();
  const { invalidateChain, invalidateBalances } = useQueryInvalidation();

  const handleSwitch = async (newChain: SupportedChain) => {
    await switchChain(newChain);

    // Invalidate queries for the new chain
    await invalidateChain(newChain);
    await invalidateBalances();
  };

  return (
    <select onChange={(e) => handleSwitch({ chainId: e.target.value, chainType: 'evm', name: e.target.value === '1' ? 'Ethereum' : 'Polygon', required: false, label: e.target.value === '1' ? 'Ethereum' : 'Polygon', interfaces: [], group: 'mainnet' })}>
      <option value="1">Ethereum</option>
      <option value="137">Polygon</option>
    </select>
  );
}
```

```tsx
// Invalidate contract queries after state change
import { useQueryInvalidation, useWalletProvider } from '@walletmesh/modal-react';

function ContractWriter() {
  const { provider } = useWalletProvider();
  const { invalidateContract, invalidateContractMethod } = useQueryInvalidation();

  const updateContractState = async () => {
    // Execute transaction that changes contract state
    const tx = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: '0xContractAddress',
        data: '0x...' // encoded function call
      }]
    });

    // Wait for confirmation
    // ... wait logic ...

    // Invalidate all queries for this contract
    await invalidateContract({ chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' }, '0xContractAddress');

    // Or invalidate specific method calls
    await invalidateContractMethod(
      { chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' },
      '0xContractAddress',
      'balanceOf(address)',
      ['0xUserAddress']
    );
  };

  return <button onClick={updateContractState}>Update Contract</button>;
}
```

```tsx
// Invalidate all contract queries when switching chains
import { useQueryInvalidation, useSwitchChain } from '@walletmesh/modal-react';

function MultiChainApp() {
  const { switchChain } = useSwitchChain();
  const { invalidateContractsByChain, invalidateContracts } = useQueryInvalidation();

  const handleChainSwitch = async (newChain: SupportedChain) => {
    await switchChain(newChain);

    // Option 1: Invalidate all contract queries across all chains
    await invalidateContracts();

    // Option 2: Invalidate only contracts on the new chain
    await invalidateContractsByChain(newChain);
  };

  return (
    <button onClick={() => handleChainSwitch({ chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' })}>
      Switch to Polygon
    </button>
  );
}
```
