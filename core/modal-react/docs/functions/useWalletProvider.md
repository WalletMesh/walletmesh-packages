[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletProvider

# Function: useWalletProvider()

> **useWalletProvider**\<`T`\>(`chain?`): [`WalletProviderInfo`](../interfaces/WalletProviderInfo.md)\<`T`\>

Defined in: [core/modal-react/src/hooks/useWalletProvider.ts:161](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletProvider.ts#L161)

Hook for accessing wallet providers for write operations

Returns a wallet provider that uses the wallet's RPC endpoints
for transaction signing and other privileged operations.

## Type Parameters

### T

`T` *extends* [`WalletProvider`](../interfaces/WalletProvider.md) = [`WalletProvider`](../interfaces/WalletProvider.md)

Expected provider type for better type inference

## Parameters

### chain?

Optional chain to get provider for. If not specified, uses current chain.

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

[`WalletProviderInfo`](../interfaces/WalletProviderInfo.md)\<`T`\>

Wallet provider information

## Since

1.0.0

## Remarks

Wallet providers are required for:
- Sending transactions
- Signing messages
- Switching chains
- Any operation requiring user approval

They use the wallet's own RPC endpoints, ensuring proper
transaction signing and security.

This hook is designed to work with the public/private provider
pattern where read operations use public providers and write
operations use wallet providers.

## Examples

```tsx
import { useWalletProvider, usePublicProvider } from '@walletmesh/modal-react';
import { ethers } from 'ethers';

function SendTransaction() {
  const { provider: walletProvider } = useWalletProvider();
  const { provider: publicProvider } = usePublicProvider();

  const sendETH = async () => {
    if (!walletProvider || !publicProvider) return;

    // Use public provider for gas estimation
    const gasPrice = await publicProvider.request({
      method: 'eth_gasPrice'
    });

    // Use wallet provider for sending transaction
    const txHash = await walletProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: '0x...',
        value: '0x' + (1e16).toString(16), // 0.01 ETH
        gasPrice
      }]
    });

    console.log('Transaction sent:', txHash);
  };

  return (
    <button onClick={sendETH}>
      Send 0.01 ETH
    </button>
  );
}
```

```tsx
// Sign messages
function MessageSigner() {
  const { provider, walletId } = useWalletProvider();
  const [signature, setSignature] = useState<string>('');

  const signMessage = async () => {
    if (!provider) return;

    const accounts = await provider.getAccounts();
    if (!accounts[0]) return;

    const sig = await provider.request({
      method: 'personal_sign',
      params: ['Hello Web3!', accounts[0]]
    });

    setSignature(sig as string);
  };

  return (
    <div>
      <button onClick={signMessage}>
        Sign Message with {walletId}
      </button>
      {signature && <p>Signature: {signature}</p>}
    </div>
  );
}
```

```tsx
// Multi-chain support
function MultiChainOperations() {
  const polygonProvider = useWalletProvider({ chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' });
  const ethereumProvider = useWalletProvider({ chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' });

  return (
    <div>
      <button
        disabled={!polygonProvider.isAvailable}
        onClick={() => console.log('Polygon operation')}
      >
        Send on Polygon
      </button>
      <button
        disabled={!ethereumProvider.isAvailable}
        onClick={() => console.log('Ethereum operation')}
      >
        Send on Ethereum
      </button>
    </div>
  );
}
```
