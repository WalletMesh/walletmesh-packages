[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useEvmWallet

# Function: useEvmWallet()

> **useEvmWallet**(`chain?`): [`EvmWalletInfo`](../interfaces/EvmWalletInfo.md)

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:193](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useEvmWallet.ts#L193)

Hook that combines account and EVM provider functionality

Provides a simplified interface that consolidates connection state,
account information, and EVM provider functionality into a single hook.
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

[`EvmWalletInfo`](../interfaces/EvmWalletInfo.md)

Consolidated EVM wallet information

## Since

1.0.0

## Remarks

This hook automatically handles:
- Connection state management
- EVM provider initialization
- Error consolidation
- Loading states
- Chain validation

The hook returns a `status` field that provides an overall state:
- `disconnected`: No wallet connected
- `connecting`: Wallet connection in progress
- `connected`: Wallet connected but EVM provider not ready
- `ready`: EVM provider fully initialized and ready for use
- `error`: Error occurred during connection or initialization

## Examples

```tsx
import { useEvmWallet } from '@walletmesh/modal-react';

function MyComponent() {
  const { isReady, evmProvider, address, error, status } = useEvmWallet();

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  if (status === 'loading') {
    return <div>Initializing EVM wallet...</div>;
  }

  if (!isReady) {
    return <div>Please connect an EVM wallet</div>;
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
  const { evmProvider, isReady, status } = useEvmWallet();

  const sendETH = async () => {
    if (!evmProvider) return;

    const txHash = await evmProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: '0x...',
        value: '0x' + (1e16).toString(16), // 0.01 ETH
      }]
    });

    console.log('Transaction sent:', txHash);
  };

  const signMessage = async () => {
    if (!evmProvider) return;

    const accounts = await evmProvider.request({ method: 'eth_accounts' });
    if (!accounts[0]) return;

    const signature = await evmProvider.request({
      method: 'personal_sign',
      params: ['Hello EVM!', accounts[0]]
    });

    console.log('Message signed:', signature);
  };

  return (
    <div>
      <button onClick={sendETH} disabled={!isReady}>
        Send 0.01 ETH
      </button>
      <button onClick={signMessage} disabled={!isReady}>
        Sign Message
      </button>
    </div>
  );
}
```

```tsx
// Usage with contract interactions
function ContractInteraction() {
  const { evmProvider, isReady, chainId } = useEvmWallet();

  const callContract = async () => {
    if (!evmProvider) return;

    const result = await evmProvider.request({
      method: 'eth_call',
      params: [{
        to: '0x...', // contract address
        data: '0x...', // function call data
      }, 'latest']
    });

    console.log('Contract call result:', result);
  };

  return (
    <div>
      <p>Chain: {chainId}</p>
      <button onClick={callContract} disabled={!isReady}>
        Call Contract
      </button>
    </div>
  );
}
```
