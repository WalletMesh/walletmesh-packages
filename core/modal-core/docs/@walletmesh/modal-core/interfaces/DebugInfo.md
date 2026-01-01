[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DebugInfo

# Interface: DebugInfo

Debug information about the current environment

## Properties

### environment

> **environment**: `object`

#### browser

> **browser**: `string`

#### mobile

> **mobile**: `boolean`

#### platform

> **platform**: `string`

#### userAgent

> **userAgent**: `string`

***

### providers

> **providers**: `object`

#### aztec?

> `optional` **aztec**: `boolean`

#### ethereum?

> `optional` **ethereum**: `boolean`

#### solana?

> `optional` **solana**: `boolean`

***

### state?

> `optional` **state**: [`HeadlessModalState`](HeadlessModalState.md)

***

### timestamp

> **timestamp**: `string`

***

### wallets

> **wallets**: `object`

#### connected?

> `optional` **connected**: `object`

##### connected.address

> **address**: `string`

##### connected.chainId

> **chainId**: `string` \| `number`

##### connected.chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

##### connected.walletId

> **walletId**: `string`

#### detected

> **detected**: `object`[]
