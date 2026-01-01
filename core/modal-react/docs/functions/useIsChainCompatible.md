[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsChainCompatible

# Function: useIsChainCompatible()

> **useIsChainCompatible**(`chain`): `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:814](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useSwitchChain.ts#L814)

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
