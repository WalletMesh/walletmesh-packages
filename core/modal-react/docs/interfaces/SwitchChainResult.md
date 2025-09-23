[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SwitchChainResult

# Interface: SwitchChainResult

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L67)

Switch chain result

## Properties

### chain

> **chain**: `object`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L69)

New chain configuration

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L71)

New chain type

***

### previousChain

> **previousChain**: `object`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L73)

Previous chain configuration

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L75)

New provider instance
