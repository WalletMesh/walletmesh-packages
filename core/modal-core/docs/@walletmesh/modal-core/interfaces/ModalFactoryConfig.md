[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ModalFactoryConfig

# Interface: ModalFactoryConfig

Configuration for creating modal components
 ModalFactoryConfig

## Properties

### autoCloseDelay?

> `optional` **autoCloseDelay**: `number`

Auto close delay in milliseconds

***

### client

> **client**: [`WalletMeshClient`](WalletMeshClient.md)

Wallet client for managing connections

***

### debug?

> `optional` **debug**: `boolean`

Debug mode

***

### initialView?

> `optional` **initialView**: `"connecting"` \| `"connected"` \| `"error"` \| `"walletSelection"` \| `"switchingChain"` \| `"proving"`

Initial view to display

***

### persistWalletSelection?

> `optional` **persistWalletSelection**: `boolean`

Whether to persist wallet selection

***

### showProviderSelection?

> `optional` **showProviderSelection**: `boolean`

Show provider selection view

***

### supportedChains?

> `optional` **supportedChains**: `object`[]

Supported chains configuration
Array of supported chain objects that define which chains the modal supports

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### name

> **name**: `string`

Human-readable name of the chain

#### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

***

### wallets

> **wallets**: [`WalletInfo`](WalletInfo.md)[]

Available wallets
