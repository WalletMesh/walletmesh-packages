[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useRequireChainType

# Function: useRequireChainType()

> **useRequireChainType**(`requiredChainType`): `object`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:865](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useSwitchChain.ts#L865)

Hook for requiring a specific chain type

Specialized hook for ensuring the user is connected to a specific
chain type (e.g., EVM, Solana) rather than a specific chain ID.

## Parameters

### requiredChainType

[`ChainType`](../enumerations/ChainType.md)

The required chain type

## Returns

`object`

Chain type validation result

### currentChainType

> **currentChainType**: `null` \| [`ChainType`](../enumerations/ChainType.md) = `state.chainType`

### error

> **error**: `null` \| `Error`

### isCorrectChainType

> **isCorrectChainType**: `boolean`

### requiredChainType

> **requiredChainType**: [`ChainType`](../enumerations/ChainType.md)

## Example

```tsx
function EvmOnlyFeature() {
  const { isCorrectChainType, currentChainType, error } = useRequireChainType('evm');

  if (!isCorrectChainType) {
    return (
      <div>
        <p>This feature requires an EVM-compatible chain.</p>
        <p>Current chain type: {currentChainType || 'Unknown'}</p>
        {error && <p style={{ color: 'red' }}>{error.message}</p>}
      </div>
    );
  }

  return <div>EVM feature ready!</div>;
}
```
