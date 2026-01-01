[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecContract

# Function: useAztecContract()

> **useAztecContract**\<`T`\>(`address?`, `artifact?`): [`UseAztecContractReturn`](../interfaces/UseAztecContractReturn.md)\<`T`\>

Defined in: [core/modal-react/src/hooks/useAztecContract.ts:137](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useAztecContract.ts#L137)

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

`null` | `AztecContractArtifact`

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
  const { contract, isLoading, error } = useAztecContract(
    tokenAddress,
    TokenContractArtifact
  );

  if (isLoading) return <div>Loading contract...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!contract) return <div>No contract loaded</div>;

  const handleTransfer = async () => {
    // Use native Aztec.js fluent API
    const sentTx = await contract.methods.transfer(recipient, amount).send();
    const receipt = await sentTx.wait();
    console.log('Transfer complete:', receipt);
  };

  const checkBalance = async () => {
    // Use native simulate() method
    const balance = await contract.methods.balance_of(userAddress).simulate();
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
// With dynamic loading and native Aztec.js patterns
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

  const executeMethod = async () => {
    if (!contract) return;
    // Use native Aztec.js API
    const sentTx = await contract.methods.someMethod().send();
    await sentTx.wait();
  };

  return (
    <div>
      <button onClick={loadContract}>Load Contract</button>
      <button onClick={refetch} disabled={!address || isLoading}>
        Refresh Contract
      </button>
      <button onClick={executeMethod} disabled={!contract}>
        Execute Method
      </button>
    </div>
  );
}
```
