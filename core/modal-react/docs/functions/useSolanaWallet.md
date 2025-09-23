[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSolanaWallet

# Function: useSolanaWallet()

> **useSolanaWallet**(`chain?`): [`SolanaWalletInfo`](../interfaces/SolanaWalletInfo.md)

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:187](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSolanaWallet.ts#L187)

Hook that combines account and Solana provider functionality

Provides a simplified interface that consolidates connection state,
account information, and Solana provider functionality into a single hook.
This reduces complexity and provides better developer experience compared
to using multiple hooks.

## Parameters

### chain?

Optional specific chain to get provider for

#### chainId

`string`

#### chainType

[`ChainType`](../enumerations/ChainType.md)

#### group?

`string`

#### icon?

`string`

#### interfaces?

`string`[]

#### label?

`string`

#### name

`string`

#### required

`boolean`

## Returns

[`SolanaWalletInfo`](../interfaces/SolanaWalletInfo.md)

Consolidated Solana wallet information

## Since

1.0.0

## Remarks

This hook automatically handles:
- Connection state management
- Solana provider initialization
- Error consolidation
- Loading states
- Chain validation

The hook returns a `status` field that provides an overall state:
- `disconnected`: No wallet connected
- `connecting`: Wallet connection in progress
- `connected`: Wallet connected but Solana provider not ready
- `ready`: Solana provider fully initialized and ready for use
- `error`: Error occurred during connection or initialization

## Examples

```tsx
import { useSolanaWallet } from '@walletmesh/modal-react';

function MyComponent() {
  const { isReady, solanaProvider, address, error, status } = useSolanaWallet();

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  if (status === 'loading') {
    return <div>Initializing Solana wallet...</div>;
  }

  if (!isReady) {
    return <div>Please connect a Solana wallet</div>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <button onClick={() => sendTransaction()}>
        Send Transaction
      </button>
    </div>
  );
}
```

```tsx
// Usage with transaction sending
function TransactionSender() {
  const { solanaProvider, isReady, status } = useSolanaWallet();

  const sendSOL = async () => {
    if (!solanaProvider) return;

    const txHash = await solanaProvider.request({
      method: 'sol_sendTransaction',
      params: [{
        to: '...',
        value: 1000000000, // 1 SOL in lamports
      }]
    });

    console.log('Transaction sent:', txHash);
  };

  const signMessage = async () => {
    if (!solanaProvider) return;

    const signature = await solanaProvider.request({
      method: 'sol_signMessage',
      params: ['Hello Solana!']
    });

    console.log('Message signed:', signature);
  };

  return (
    <div>
      <button onClick={sendSOL} disabled={!isReady}>
        Send 1 SOL
      </button>
      <button onClick={signMessage} disabled={!isReady}>
        Sign Message
      </button>
    </div>
  );
}
```

```tsx
// Usage with program interactions
function ProgramInteraction() {
  const { solanaProvider, isReady, chainId } = useSolanaWallet();

  const callProgram = async () => {
    if (!solanaProvider) return;

    const result = await solanaProvider.request({
      method: 'sol_getAccountInfo',
      params: ['...'] // program address
    });

    console.log('Program call result:', result);
  };

  return (
    <div>
      <p>Cluster: {chainId}</p>
      <button onClick={callProgram} disabled={!isReady}>
        Call Program
      </button>
    </div>
  );
}
```
