[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ModalFactoryConfig

# Interface: ModalFactoryConfig

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:26

Configuration for creating modal components
 ModalFactoryConfig

## Properties

### autoCloseDelay?

> `optional` **autoCloseDelay**: `number`

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:52

Auto close delay in milliseconds

***

### client

> **client**: [`WalletMeshClient`](WalletMeshClient.md)

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:36

Wallet client for managing connections

***

### debug?

> `optional` **debug**: `boolean`

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:67

Debug mode

***

### initialView?

> `optional` **initialView**: `"walletSelection"` \| `"connecting"` \| `"connected"` \| `"error"` \| `"switchingChain"` \| `"proving"`

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:47

Initial view to display

***

### persistWalletSelection?

> `optional` **persistWalletSelection**: `boolean`

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:57

Whether to persist wallet selection

***

### showProviderSelection?

> `optional` **showProviderSelection**: `boolean`

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:62

Show provider selection view

***

### supportedChains?

> `optional` **supportedChains**: `object`[]

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:42

Supported chains configuration
Array of supported chain objects that define which chains the modal supports

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

### wallets

> **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: core/modal-core/dist/internal/factories/modalFactory.d.ts:31

Available wallets
