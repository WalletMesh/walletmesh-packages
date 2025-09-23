[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecContract

# Function: useAztecContract()

> **useAztecContract**\<`T`\>(`address?`, `artifact?`): [`UseAztecContractReturn`](../interfaces/UseAztecContractReturn.md)\<`T`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useAztecContract.ts#L128)

Hook for managing Aztec contract instances

This hook provides a convenient way to get and cache contract instances,
similar to the Contract.at() pattern in aztec.js. The contract instance
is cached and only re-fetched when the address or artifact changes.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### address?

The contract address (optional)

`null` | `string` | `AztecAddress`

### artifact?

The contract artifact containing ABI (optional)

`null` | `ContractArtifact`

## Returns

[`UseAztecContractReturn`](../interfaces/UseAztecContractReturn.md)\<`T`\>

Contract instance and loading state

## Since

1.0.0

## Remarks

The hook automatically handles:
- Loading states while fetching the contract
- Error handling if the contract cannot be loaded
- Caching to avoid unnecessary re-fetches
- Re-fetching when address or artifact changes

Both address and artifact must be provided to load a contract.
If either is missing, the hook returns null for the contract.

## Examples

```tsx
import { useAztecContract } from '@walletmesh/modal-react';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function TokenInteraction({ tokenAddress }) {
  const { contract, isLoading, error, execute, simulate } = useAztecContract(
    tokenAddress,
    TokenContractArtifact
  );

  if (isLoading) return <div>Loading contract...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!contract) return <div>No contract loaded</div>;

  const handleTransfer = async () => {
    // No type casting needed - execute handles wallet interaction
    const receipt = await execute(
      contract.methods.transfer(recipient, amount)
    );
    console.log('Transfer complete:', receipt);
  };

  const checkBalance = async () => {
    // Simulate read-only calls
    const balance = await simulate(
      contract.methods.balance_of(userAddress)
    );
    console.log('Balance:', balance);
  };

  return (
    <div>
      <button onClick={handleTransfer}>Transfer</button>
      <button onClick={checkBalance}>Check Balance</button>
    </div>
  );
}
```

```tsx
// With dynamic loading
function ContractLoader() {
  const [address, setAddress] = useState(null);
  const [artifact, setArtifact] = useState(null);

  const { contract, isLoading, refetch } = useAztecContract(
    address,
    artifact
  );

  const loadContract = async () => {
    setAddress(someAddress);
    setArtifact(await fetchArtifact());
  };

  return (
    <div>
      <button onClick={loadContract}>Load Contract</button>
      <button onClick={refetch} disabled={!address || isLoading}>
        Refresh Contract
      </button>
    </div>
  );
}
```
