[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshState

# Interface: WalletMeshState

Defined in: core/modal-core/dist/state/store.d.ts:38

Normalized WalletMesh state structure

State is normalized with:
- entities: Normalized data storage
- ui: Minimal UI state (non-derived)
- active: Active entity references (IDs only)
- meta: Metadata and timestamps

## Properties

### active

> **active**: `object`

Defined in: core/modal-core/dist/state/store.d.ts:63

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

Defined in: core/modal-core/dist/state/store.d.ts:39

#### sessions

> **sessions**: `Record`\<`string`, [`SessionState`](SessionState.md)\>

#### transactions

> **transactions**: `Record`\<`string`, [`CoreTransactionResult`](CoreTransactionResult.md)\>

#### wallets

> **wallets**: `Record`\<`string`, [`WalletInfo`](WalletInfo.md)\>

***

### meta

> **meta**: `object`

Defined in: core/modal-core/dist/state/store.d.ts:69

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

Defined in: core/modal-core/dist/state/store.d.ts:44

#### currentView

> **currentView**: [`ModalView`](../type-aliases/ModalView.md)

#### errors

> **errors**: `Record`\<`string`, [`ModalError`](../type-aliases/ModalError.md)\>

#### loading

> **loading**: `LoadingState`

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
