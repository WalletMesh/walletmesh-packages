[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useSolanaWalletRequired

# Function: useSolanaWalletRequired()

> **useSolanaWalletRequired**(`chain?`): `Required`\<`Pick`\<[`SolanaWalletInfo`](../interfaces/SolanaWalletInfo.md), `"address"` \| `"solanaProvider"`\>\> & [`SolanaWalletInfo`](../interfaces/SolanaWalletInfo.md)

Defined in: [core/modal-react/src/hooks/useSolanaWallet.ts:287](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSolanaWallet.ts#L287)

Hook that throws an error if Solana wallet is not ready

Convenience hook for components that require a Solana wallet to function.
Will throw an error with helpful message if wallet is not connected or ready.

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

`Required`\<`Pick`\<[`SolanaWalletInfo`](../interfaces/SolanaWalletInfo.md), `"address"` \| `"solanaProvider"`\>\> & [`SolanaWalletInfo`](../interfaces/SolanaWalletInfo.md)

Solana wallet information (guaranteed to be ready)

## Throws

Error if wallet is not ready

## Example

```tsx
function RequiresSolanaWallet() {
  const { solanaProvider, address } = useSolanaWalletRequired();

  // solanaProvider is guaranteed to be non-null here
  const sendTransaction = () => solanaProvider.request({
    method: 'sol_sendTransaction',
    params: [{ to: '...', value: 1000000000 }]
  });

  return <button onClick={sendTransaction}>Send Transaction</button>;
}
```
