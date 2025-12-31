[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / shallowEqual

# Function: shallowEqual()

> **shallowEqual**\<`T`\>(`a`, `b`): `boolean`

Defined in: [core/modal-react/src/hooks/internal/useStore.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/internal/useStore.ts#L196)

Shallow equality check for store selectors

Same implementation as before - useful for preventing
unnecessary re-renders when selecting multiple values from store.

## Type Parameters

### T

`T`

## Parameters

### a

`T`

First value to compare

### b

`T`

Second value to compare

## Returns

`boolean`

True if values are shallowly equal, false otherwise
