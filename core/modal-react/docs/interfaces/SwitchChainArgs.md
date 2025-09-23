[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SwitchChainArgs

# Interface: SwitchChainArgs

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L42)

Switch chain arguments

## Properties

### addChainData?

> `optional` **addChainData**: `object`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L46)

Optional chain addition data for chains not yet added to wallet

#### blockExplorerUrls?

> `optional` **blockExplorerUrls**: `string`[]

Block explorer URLs (optional)

#### chainName

> **chainName**: `string`

Chain name as displayed in wallet

#### nativeCurrency

> **nativeCurrency**: `object`

Native currency info

##### nativeCurrency.decimals

> **decimals**: `number`

##### nativeCurrency.name

> **name**: `string`

##### nativeCurrency.symbol

> **symbol**: `string`

#### rpcUrls

> **rpcUrls**: `string`[]

RPC URLs in order of preference

***

### chain

> **chain**: `object`

Defined in: [core/modal-react/src/hooks/useSwitchChain.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useSwitchChain.ts#L44)

Chain to switch to

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
