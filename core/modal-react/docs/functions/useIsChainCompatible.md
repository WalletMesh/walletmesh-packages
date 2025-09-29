[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsChainCompatible

# Function: useIsChainCompatible()

> **useIsChainCompatible**(`chain`): `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:812](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useSwitchChain.ts#L812)

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
