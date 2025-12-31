[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecWallet

# Function: useAztecWallet()

> **useAztecWallet**(`chain?`): [`AztecWalletInfo`](../interfaces/AztecWalletInfo.md)

Defined in: [core/modal-react/src/hooks/useAztecWallet.ts:258](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecWallet.ts#L258)

Hook that combines account and Aztec provider functionality

Provides a simplified interface that consolidates connection state,
account information, and Aztec wallet functionality into a single hook.
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

[`AztecWalletInfo`](../interfaces/AztecWalletInfo.md)

Consolidated Aztec wallet information

## Since

1.0.0

## Remarks

This hook automatically handles:
- Connection state management
- Aztec wallet initialization
- Error consolidation
- Loading states
- Chain validation

The hook returns a `status` field that provides an overall state:
- `disconnected`: No wallet connected
- `connecting`: Wallet connection in progress
- `connected`: Wallet connected but Aztec wallet not ready
- `ready`: Aztec wallet fully initialized and ready for use
- `error`: Error occurred during connection or initialization

## Examples

```tsx
import { useAztecWallet } from '@walletmesh/modal-react';

function MyComponent() {
  const { isReady, aztecWallet, address, error, status } = useAztecWallet();

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  if (status === 'connecting') {
    return <div>Initializing Aztec wallet...</div>;
  }

  if (!isReady) {
    return <div>Please connect an Aztec wallet</div>;
  }

  return (
    <div>
      <p>Connected: {address}</p>
      <button onClick={() => deployContract()}>
        Deploy Contract
      </button>
    </div>
  );
}
```

```tsx
// Usage with contract interactions
function ContractInteraction() {
  const { aztecWallet, isReady, status } = useAztecWallet();

  const deployContract = async () => {
    if (!aztecWallet) return;

    const deployment = await aztecWallet.deployContract(
      TokenContract,
      [ownerAddress, 'MyToken', 'MTK', 18]
    );

    const contract = await deployment.deployed();
    console.log('Contract deployed:', contract.address);
  };

  const sendTransaction = async () => {
    if (!aztecWallet) return;

    const contract = await Contract.at(contractAddress, TokenContract, aztecWallet);
    const interaction = contract.methods.transfer(recipient, amount);

    // Use standard Aztec transaction flow
    const txRequest = await interaction.request();
    const provenTx = await aztecWallet.proveTx(txRequest);
    const txHash = await aztecWallet.sendTx(provenTx);
    const receipt = await aztecWallet.getTxReceipt(txHash);

    console.log('Transaction complete:', receipt);
  };

  return (
    <div>
      <button onClick={deployContract} disabled={!isReady}>
        Deploy Contract
      </button>
      <button onClick={sendTransaction} disabled={!isReady}>
        Send Transaction
      </button>
    </div>
  );
}
```
