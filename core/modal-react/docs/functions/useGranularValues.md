[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useGranularValues

# Function: useGranularValues()

> **useGranularValues**\<`T`\>(`selector`): `T`

Defined in: [core/modal-react/src/hooks/granular/index.ts:243](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/granular/index.ts#L243)

Hook composition helper for multiple granular values
Only re-renders when specific selected values change

## Type Parameters

### T

`T`

## Parameters

### selector

(`state`) => `T`

## Returns

`T`

## Example

```tsx
const { address, chainId, isConnected } = useGranularValues(
  state => ({
    address: getActiveSession(state)?.activeAccount?.address,
    chainId: getActiveSession(state)?.chain?.chainId,
    isConnected: getConnectionStatus(state) === 'connected'
  })
);
```
