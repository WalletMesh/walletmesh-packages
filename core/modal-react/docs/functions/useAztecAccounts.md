[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecAccounts

# Function: useAztecAccounts()

> **useAztecAccounts**(): [`UseAztecAccountsReturn`](../interfaces/UseAztecAccountsReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:134](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L134)

Hook for managing multiple Aztec accounts

This hook provides functionality for working with multiple accounts
in an Aztec wallet, including switching between accounts and signing
messages. Note that some functionality may not be fully implemented
in all wallet providers yet.

## Returns

[`UseAztecAccountsReturn`](../interfaces/UseAztecAccountsReturn.md)

Account management functions and state

## Since

1.0.0

## Remarks

The hook provides:
- List of all registered accounts
- Current active account information
- Account switching functionality
- Message signing capability
- Loading and error states

Note: Multi-account support depends on the wallet implementation.
Currently, most wallets only support a single account.

## Examples

```tsx
import { useAztecAccounts } from '@walletmesh/modal-react';

function AccountManager() {
  const {
    accounts,
    activeAccount,
    switchAccount,
    signMessage,
    isLoading
  } = useAztecAccounts();

  if (isLoading) return <div>Loading accounts...</div>;

  return (
    <div>
      <h3>Active Account</h3>
      <p>{activeAccount?.address}</p>

      <h3>All Accounts</h3>
      {accounts.map((account) => (
        <div key={account.address.toString()}>
          <span>{account.label || 'Account'}</span>
          <button
            onClick={() => switchAccount(account.address)}
            disabled={account.isActive}
          >
            {account.isActive ? 'Active' : 'Switch'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// Message signing
function MessageSigner() {
  const { signMessage, activeAccount } = useAztecAccounts();
  const [signature, setSignature] = useState('');

  const handleSign = async () => {
    try {
      const sig = await signMessage('Hello Aztec!');
      setSignature(sig);
    } catch (error) {
      console.error('Failed to sign:', error);
    }
  };

  return (
    <div>
      <p>Signing as: {activeAccount?.address}</p>
      <button onClick={handleSign}>Sign Message</button>
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}
```
