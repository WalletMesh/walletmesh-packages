[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / uiActions

# Type Alias: uiActions

> **uiActions** = `object`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:13

UI action functions

## Properties

### addDiscoveryError()

> **addDiscoveryError**: (`store`, `error`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:72

Add discovery error

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### error

`string`

#### Returns

`void`

***

### clearAllErrors()

> **clearAllErrors**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:56

Clear all errors

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

***

### clearDiscoveryErrors()

> **clearDiscoveryErrors**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:76

Clear discovery errors

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

***

### clearError()

> **clearError**: (`store`, `context`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:52

Clear error for a specific context

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### context

`string`

#### Returns

`void`

***

### clearViewHistory()

> **clearViewHistory**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:114

Clear view history

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

***

### clearWalletFilter()

> **clearWalletFilter**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:106

Clear wallet filter

Convenience method to clear the wallet filter.

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

The store instance

#### Returns

`void`

***

### closeModal()

> **closeModal**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:21

Close the wallet connection modal

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

***

### goBack()

> **goBack**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:110

Navigate back in modal view history

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

***

### openModal()

> **openModal**: (`store`, `targetChainType?`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:17

Open the wallet connection modal

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

***

### setError()

> **setError**: (`store`, `context`, `error?`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:37

Set error state for a specific context

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### context

`string`

##### error?

###### category

`"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`

###### cause?

`unknown`

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

###### code

`string`

###### data?

`Record`\<`string`, `unknown`\>

###### maxRetries?

`number`

###### message

`string`

###### recoveryStrategy?

`"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`

###### retryDelay?

`number`

#### Returns

`void`

***

### setLoading()

> **setLoading**: (`store`, `context`, `loading`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:29

Set loading state for a specific context

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### context

keyof `LoadingState`

##### loading

`boolean`

#### Returns

`void`

***

### setModalLoading()

> **setModalLoading**: (`store`, `loading`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:33

Set global modal loading state (convenience method)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### loading

`boolean`

#### Returns

`void`

***

### setSessionError()

> **setSessionError**: (`store`, `error?`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:48

Set session error (convenience method)

Stores a session-related error in the UI state. This error will be
detected by the useSessionError hook in modal-react.

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### error?

###### category

`"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`

###### cause?

`unknown`

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

###### code

`string`

###### data?

`Record`\<`string`, `unknown`\>

###### maxRetries?

`number`

###### message

`string`

###### recoveryStrategy?

`"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`

###### retryDelay?

`number`

#### Returns

`void`

***

### setSwitchingChainData()

> **setSwitchingChainData**: (`store`, `data?`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:80

Set chain switching data for UI display

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### data?

###### fromChain?

\{ `chainId`: `string`; `name?`: `string`; \}

###### fromChain.chainId

`string`

###### fromChain.name?

`string`

###### toChain?

\{ `chainId`: `string`; `name?`: `string`; \}

###### toChain.chainId

`string`

###### toChain.name?

`string`

#### Returns

`void`

***

### setTargetChainType()

> **setTargetChainType**: (`store`, `chainType?`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:60

Set target chain type for wallet filtering

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### chainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

***

### setUIError()

> **setUIError**: (`store`, `error?`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:41

Set UI error (convenience method)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### error?

###### category

`"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`

###### cause?

`unknown`

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

###### code

`string`

###### data?

`Record`\<`string`, `unknown`\>

###### maxRetries?

`number`

###### message

`string`

###### recoveryStrategy?

`"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`

###### retryDelay?

`number`

#### Returns

`void`

***

### setView()

> **setView**: (`store`, `view`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:25

Set the current modal view

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### view

[`ModalView`](ModalView.md)

#### Returns

`void`

***

### setWalletFilter()

> **setWalletFilter**: (`store`, `filter`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:98

Set wallet filter function

Sets a filter function to limit which wallets are shown in the modal.

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

The store instance

##### filter

Filter function or null to clear the filter

`null` | (`wallet`) => `boolean`

#### Returns

`void`

***

### startDiscovery()

> **startDiscovery**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:64

Start wallet discovery scan

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

***

### stopDiscovery()

> **stopDiscovery**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/ui.d.ts:68

Stop wallet discovery scan

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`
