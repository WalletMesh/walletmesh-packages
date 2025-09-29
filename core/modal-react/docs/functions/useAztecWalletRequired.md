[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecWalletRequired

# Function: useAztecWalletRequired()

> **useAztecWalletRequired**(`chain?`): `Required`\<`Pick`\<[`AztecWalletInfo`](../interfaces/AztecWalletInfo.md), `"address"` \| `"aztecWallet"`\>\> & [`AztecWalletInfo`](../interfaces/AztecWalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:475](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecWallet.ts#L475)

Hook that throws an error if Aztec wallet is not ready

Convenience hook for components that require an Aztec wallet to function.
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

`Required`\<`Pick`\<[`AztecWalletInfo`](../interfaces/AztecWalletInfo.md), `"address"` \| `"aztecWallet"`\>\> & [`AztecWalletInfo`](../interfaces/AztecWalletInfo.md)

Aztec wallet information (guaranteed to be ready)

## Throws

Error if wallet is not ready

## Example

```tsx
function RequiresWallet() {
  const { aztecWallet, address } = useAztecWalletRequired();

  // aztecWallet is guaranteed to be non-null here
  const deployContract = () => aztecWallet.deployContract(...);

  return <button onClick={deployContract}>Deploy</button>;
}
```
