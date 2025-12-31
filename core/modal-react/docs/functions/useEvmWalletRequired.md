[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useEvmWalletRequired

# Function: useEvmWalletRequired()

> **useEvmWalletRequired**(`chain?`): `Required`\<`Pick`\<[`EvmWalletInfo`](../interfaces/EvmWalletInfo.md), `"address"` \| `"evmProvider"`\>\> & [`EvmWalletInfo`](../interfaces/EvmWalletInfo.md)

Defined in: [core/modal-react/src/hooks/useEvmWallet.ts:288](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useEvmWallet.ts#L288)

Hook that throws an error if EVM wallet is not ready

Convenience hook for components that require an EVM wallet to function.
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

`Required`\<`Pick`\<[`EvmWalletInfo`](../interfaces/EvmWalletInfo.md), `"address"` \| `"evmProvider"`\>\> & [`EvmWalletInfo`](../interfaces/EvmWalletInfo.md)

EVM wallet information (guaranteed to be ready)

## Throws

Error if wallet is not ready

## Example

```tsx
function RequiresEvmWallet() {
  const { evmProvider, address } = useEvmWalletRequired();

  // evmProvider is guaranteed to be non-null here
  const sendTransaction = () => evmProvider.request({
    method: 'eth_sendTransaction',
    params: [{ to: '0x...', value: '0x0' }]
  });

  return <button onClick={sendTransaction}>Send Transaction</button>;
}
```
