[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecAuth

# Function: useAztecAuth()

> **useAztecAuth**(): [`UseAztecAuthReturn`](../interfaces/UseAztecAuthReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecAuth.ts:212](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAuth.ts#L212)

Hook for managing Aztec authorization witnesses

This hook provides functionality for creating and managing auth witnesses,
which allow delegating actions to other accounts. Auth witnesses can be
created for contract interactions, messages, or batches of operations.

## Returns

[`UseAztecAuthReturn`](../interfaces/UseAztecAuthReturn.md)

Auth witness management functions and state

## Since

1.0.0

## Remarks

The hook provides:
- Auth witness creation for interactions and messages
- Batch auth witness creation
- Auth witness verification
- Local storage management for witnesses
- Progress tracking and error handling

Auth witnesses are used in Aztec for delegated transactions,
meta-transactions, and other authorization schemes.

## Examples

```tsx
import { useAztecAuth, useAztecContract } from '@walletmesh/modal-react';

function DelegatedTransfer({ tokenContract }) {
  const {
    createAuthWit,
    storeWitnesses,
    storedEntries
  } = useAztecAuth();

  const handleCreateDelegation = async () => {
    // Create auth witness for transfer
    const interaction = tokenContract.methods.transfer(
      recipientAddress,
      amount
    );

    const authWit = await createAuthWit(
      interaction,
      'Delegate transfer of 100 tokens'
    );

    // Store for later sharing
    const storageKey = storeWitnesses([authWit], 'Token Transfer Delegation');

    // Share storageKey with delegate
    await shareWithDelegate(storageKey);
  };

  return (
    <div>
      <button onClick={handleCreateDelegation}>
        Create Transfer Delegation
      </button>

      <h3>Stored Delegations ({storedEntries.length})</h3>
      {storedEntries.map((entry) => (
        <div key={entry.id}>
          {entry.label} - {entry.witnesses.length} witnesses
          <button onClick={() => removeStoredEntry(entry.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// Message signing for authentication
function AuthenticationFlow() {
  const { createMessageAuthWit, verifyAuthWit } = useAztecAuth();
  const [authToken, setAuthToken] = useState(null);

  const handleLogin = async () => {
    // Create auth witness for login message
    const timestamp = Date.now();
    const message = `Login to MyDApp at ${timestamp}`;

    const authWit = await createMessageAuthWit(
      message,
      'Login authentication'
    );

    // Send to backend for verification
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ authWit, timestamp }),
    });

    const { token } = await response.json();
    setAuthToken(token);
  };

  return (
    <button onClick={handleLogin}>
      Sign In with Aztec
    </button>
  );
}
```

```tsx
// Batch delegations for complex operations
function BatchDelegation({ contracts }) {
  const { createBatchAuthWit, isCreating } = useAztecAuth();

  const handleBatchDelegation = async () => {
    const interactions = [
      contracts.token1.methods.approve(spender, amount1),
      contracts.token2.methods.approve(spender, amount2),
      contracts.dex.methods.swap(token1, token2, amount1),
    ];

    const witnesses = await createBatchAuthWit(interactions);
    console.log(`Created ${witnesses.length} auth witnesses`);

    // Process witnesses...
  };

  return (
    <button onClick={handleBatchDelegation} disabled={isCreating}>
      {isCreating ? 'Creating...' : 'Create Batch Delegation'}
    </button>
  );
}
```
