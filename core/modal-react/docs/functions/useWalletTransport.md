[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useWalletTransport

# Function: useWalletTransport()

> **useWalletTransport**(): [`WalletTransportInfo`](../interfaces/WalletTransportInfo.md)

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:162](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletTransport.ts#L162)

Hook for accessing the raw wallet transport

Returns the underlying transport layer for direct JSON-RPC communication,
bypassing provider abstractions. This is useful for advanced use cases
where you need custom RPC methods or direct protocol access.

## Returns

[`WalletTransportInfo`](../interfaces/WalletTransportInfo.md)

Wallet transport information

## Since

1.0.0

## Remarks

Direct transport access is for advanced users who need:
- Custom RPC methods not exposed by standard providers
- Direct protocol-level communication
- Custom serialization/deserialization
- Bypassing provider abstractions for performance

For standard blockchain operations, use provider adapters instead.

## Examples

```tsx
import { useWalletTransport } from '@walletmesh/modal-react';

function CustomRPCExample() {
  const { transport, isAvailable } = useWalletTransport();

  const callCustomMethod = async () => {
    if (!transport) return;

    // Direct RPC call with custom method
    const result = await transport.request({
      method: 'wallet_customMethod',
      params: { custom: 'data' },
      chainId: 'custom-chain',
    });

    console.log('Custom result:', result);
  };

  return (
    <button onClick={callCustomMethod} disabled={!isAvailable}>
      Call Custom Method
    </button>
  );
}
```

```tsx
// Get wallet capabilities
function WalletCapabilities() {
  const { transport, isAvailable } = useWalletTransport();
  const [capabilities, setCapabilities] = useState(null);

  useEffect(() => {
    if (!transport) return;

    transport.getCapabilities().then(caps => {
      setCapabilities(caps);
      console.log('Supported methods:', caps.methods);
      console.log('Provider types:', caps.providerTypes);
      console.log('Chains:', caps.chains);
    });
  }, [transport]);

  if (!isAvailable) {
    return <div>Connect wallet to see capabilities</div>;
  }

  return (
    <div>
      <h3>Wallet Capabilities</h3>
      <pre>{JSON.stringify(capabilities, null, 2)}</pre>
    </div>
  );
}
```

```tsx
// Subscribe to transport events
function TransportEventListener() {
  const { transport } = useWalletTransport();

  useEffect(() => {
    if (!transport) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed:', chainId);
    };

    transport.on('accountsChanged', handleAccountsChanged);
    transport.on('chainChanged', handleChainChanged);

    return () => {
      transport.off('accountsChanged', handleAccountsChanged);
      transport.off('chainChanged', handleChainChanged);
    };
  }, [transport]);

  return <div>Listening to transport events...</div>;
}
```
