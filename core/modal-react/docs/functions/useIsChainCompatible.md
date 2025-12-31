[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useIsChainCompatible

# Function: useIsChainCompatible()

> **useIsChainCompatible**(`chain`): `boolean`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:814](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useSwitchChain.ts#L814)

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
