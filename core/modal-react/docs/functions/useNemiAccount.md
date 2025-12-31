[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useNemiAccount

# Function: useNemiAccount()

> **useNemiAccount**(`chainId?`): [`UseNemiAccountReturn`](../interfaces/UseNemiAccountReturn.md)

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useNemiAccount.ts#L118)

Hook for creating nemi SDK-compatible Account from WalletMesh connection

This hook automatically creates a nemi Account instance when connected to
an Aztec wallet through WalletMesh. The Account can be used with nemi SDK's
Contract classes and patterns.

## Parameters

### chainId?

`string`

Optional specific chain ID to create account for

## Returns

[`UseNemiAccountReturn`](../interfaces/UseNemiAccountReturn.md)

Account instance, loading state, and error state

## Examples

```tsx
import { useNemiAccount } from '@walletmesh/modal-react';
import { Contract } from '@nemi-fi/wallet-sdk/eip1193';
import { TokenContract } from './contracts';

function MyComponent() {
  const { account, isLoading, error, isReady } = useNemiAccount();

  if (isLoading) return <div>Loading account...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Please connect an Aztec wallet</div>;

  const handleDeployToken = async () => {
    class Token extends Contract.fromAztec(TokenContract) {}
    const deployment = await Token.deploy(
      account,
      ownerAddress,
      'MyToken',
      'MTK',
      18
    );
    const contract = await deployment.deployed();
    console.log('Contract deployed:', contract.address);
  };

  return (
    <button onClick={handleDeployToken}>
      Deploy Token Contract
    </button>
  );
}
```

```tsx
// Specify a particular chain
function MultiChainComponent() {
  const mainnetAccount = useNemiAccount('31337');
  const testnetAccount = useNemiAccount('31338');

  return (
    <div>
      <p>Mainnet ready: {mainnetAccount.isReady ? 'Yes' : 'No'}</p>
      <p>Testnet ready: {testnetAccount.isReady ? 'Yes' : 'No'}</p>
    </div>
  );
}
```
