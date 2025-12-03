[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / usePublicProvider

# Function: usePublicProvider()

> **usePublicProvider**(`chain?`): [`PublicProviderInfo`](../interfaces/PublicProviderInfo.md)

Defined in: [core/modal-react/src/hooks/usePublicProvider.ts:141](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/usePublicProvider.ts#L141)

Hook for accessing public providers for read operations

Returns a public provider that uses dApp-specified RPC endpoints
for blockchain read operations, allowing applications to control
their infrastructure and costs.

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

[`PublicProviderInfo`](../interfaces/PublicProviderInfo.md)

Public provider information

## Since

1.0.0

## Remarks

Public providers are ideal for:
- Reading blockchain state (balances, contract data)
- Estimating gas prices
- Querying transaction status
- Any read-only operation

They use your application's RPC endpoints configured in the
chains array passed to WalletMeshProvider.

## Examples

```tsx
import { usePublicProvider } from '@walletmesh/modal-react';

function BlockNumber() {
  const { provider, isAvailable } = usePublicProvider();
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!isAvailable || !provider) return;

    const fetchBlockNumber = async () => {
      const block = await provider.request({
        method: 'eth_blockNumber'
      });
      setBlockNumber(parseInt(block as string, 16));
    };

    fetchBlockNumber();
    const interval = setInterval(fetchBlockNumber, 12000);

    return () => clearInterval(interval);
  }, [provider, isAvailable]);

  if (!isAvailable) return <div>No provider available</div>;

  return <div>Block: {blockNumber}</div>;
}
```

```tsx
// Query specific chain
function PolygonBalance() {
  const { provider } = usePublicProvider({ chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' });
  const [balance, setBalance] = useState<string>('0');

  const checkBalance = async (address: string) => {
    if (!provider) return;

    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });

    setBalance(balance as string);
  };

  return (
    <div>
      <input
        placeholder="Enter address"
        onBlur={(e) => checkBalance(e.target.value)}
      />
      <p>Balance: {balance}</p>
    </div>
  );
}
```

```tsx
// Read contract data
function ContractReader() {
  const { provider } = usePublicProvider();

  const readContract = async () => {
    if (!provider) return;

    const data = await provider.request({
      method: 'eth_call',
      params: [{
        to: '0xContractAddress',
        data: '0xMethodSelector'
      }, 'latest']
    });

    console.log('Contract data:', data);
  };

  return (
    <button onClick={readContract}>
      Read Contract
    </button>
  );
}
```
