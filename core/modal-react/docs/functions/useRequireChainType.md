[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useRequireChainType

# Function: useRequireChainType()

> **useRequireChainType**(`requiredChainType`): `object`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:867](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSwitchChain.ts#L867)

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
