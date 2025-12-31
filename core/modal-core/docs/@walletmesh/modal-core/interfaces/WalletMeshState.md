[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMeshState

# Interface: WalletMeshState

Normalized WalletMesh state structure

State is normalized with:
- entities: Normalized data storage
- ui: Minimal UI state (non-derived)
- active: Active entity references (IDs only)
- meta: Metadata and timestamps

## Properties

### active

> **active**: `object`

#### selectedWalletId

> **selectedWalletId**: `null` \| `string`

#### sessionId

> **sessionId**: `null` \| `string`

#### transactionId

> **transactionId**: `null` \| `string`

#### walletId

> **walletId**: `null` \| `string`

***

### entities

> **entities**: `object`

#### sessions

> **sessions**: `Record`\<`string`, [`SessionState`](SessionState.md)\>

#### transactions

> **transactions**: `Record`\<`string`, [`TransactionResult`](TransactionResult.md)\>

#### wallets

> **wallets**: `Record`\<`string`, [`WalletInfo`](WalletInfo.md)\>

***

### meta

> **meta**: `object`

#### availableWalletIds

> **availableWalletIds**: `string`[]

#### backgroundTransactionIds

> **backgroundTransactionIds**: `string`[]

#### connectionTimestamps

> **connectionTimestamps**: `Record`\<`string`, `number`\>

#### discoveryErrors

> **discoveryErrors**: `string`[]

#### lastDiscoveryTime

> **lastDiscoveryTime**: `null` \| `number`

#### transactionStatus

> **transactionStatus**: [`TransactionStatus`](../type-aliases/TransactionStatus.md)

***

### ui

> **ui**: `object`

#### currentView

> **currentView**: [`ModalView`](../type-aliases/ModalView.md)

#### errors

> **errors**: `Record`\<`string`, [`ModalError`](../type-aliases/ModalError.md)\>

#### loading

> **loading**: [`LoadingState`](LoadingState.md)

#### modalOpen

> **modalOpen**: `boolean`

#### switchingChainData?

> `optional` **switchingChainData**: `object`

##### switchingChainData.fromChain?

> `optional` **fromChain**: `object`

##### switchingChainData.fromChain.chainId

> **chainId**: `string`

##### switchingChainData.fromChain.name?

> `optional` **name**: `string`

##### switchingChainData.toChain?

> `optional` **toChain**: `object`

##### switchingChainData.toChain.chainId

> **chainId**: `string`

##### switchingChainData.toChain.name?

> `optional` **name**: `string`

#### targetChainType?

> `optional` **targetChainType**: [`ChainType`](../enumerations/ChainType.md)

#### viewHistory

> **viewHistory**: [`ModalView`](../type-aliases/ModalView.md)[]

#### walletFilter()?

> `optional` **walletFilter**: (`wallet`) => `boolean`

##### Parameters

###### wallet

[`WalletInfo`](WalletInfo.md)

##### Returns

`boolean`
