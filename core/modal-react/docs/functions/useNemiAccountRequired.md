[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useNemiAccountRequired

# Function: useNemiAccountRequired()

> **useNemiAccountRequired**(`chainId?`): `Required`\<`Pick`\<[`UseNemiAccountReturn`](../interfaces/UseNemiAccountReturn.md), `"account"`\>\> & [`UseNemiAccountReturn`](../interfaces/UseNemiAccountReturn.md)

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:207](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L207)

Hook that throws an error if nemi account is not ready

Convenience hook for components that require a nemi Account to function.
Will throw an error with helpful message if account is not connected or ready.

## Parameters

### chainId?

`string`

Optional specific chain ID to create account for

## Returns

`Required`\<`Pick`\<[`UseNemiAccountReturn`](../interfaces/UseNemiAccountReturn.md), `"account"`\>\> & [`UseNemiAccountReturn`](../interfaces/UseNemiAccountReturn.md)

Account instance (guaranteed to be non-null)

## Throws

Error if account is not ready

## Example

```tsx
function RequiresAccount() {
  const { account } = useNemiAccountRequired();

  // account is guaranteed to be non-null here
  const handleDeployContract = async () => {
    class Token extends Contract.fromAztec(TokenContract) {}
    const deployment = await Token.deploy(account, ...args);
    return deployment.deployed();
  };

  return <button onClick={handleDeployContract}>Deploy</button>;
}
```
