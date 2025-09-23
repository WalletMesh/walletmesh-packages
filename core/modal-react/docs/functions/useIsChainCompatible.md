[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsChainCompatible

# Function: useIsChainCompatible()

> **useIsChainCompatible**(`chain`): `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:812](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L812)

Hook to validate chain compatibility

Checks if a chain is compatible with the current wallet.

## Parameters

### chain

Chain to validate

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

`boolean`

True if compatible, false otherwise

## Since

1.0.0
