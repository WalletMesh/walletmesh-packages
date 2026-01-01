[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / uiActions

# Variable: uiActions

> `const` **uiActions**: `object`

UI action functions

## Type Declaration

### addDiscoveryError()

> **addDiscoveryError**: (`store`, `error`) => `void`

Add discovery error

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### error

`string`

#### Returns

`void`

### clearAllErrors()

> **clearAllErrors**: (`store`) => `void`

Clear all errors

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### clearDiscoveryErrors()

> **clearDiscoveryErrors**: (`store`) => `void`

Clear discovery errors

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### clearError()

> **clearError**: (`store`, `context`) => `void`

Clear error for a specific context

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### context

`string`

#### Returns

`void`

### clearViewHistory()

> **clearViewHistory**: (`store`) => `void`

Clear view history

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### clearWalletFilter()

> **clearWalletFilter**: (`store`) => `void`

Clear wallet filter

Convenience method to clear the wallet filter.

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

The store instance

#### Returns

`void`

### closeModal()

> **closeModal**: (`store`) => `void`

Close the wallet connection modal

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### goBack()

> **goBack**: (`store`) => `void`

Navigate back in modal view history

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### openModal()

> **openModal**: (`store`, `targetChainType?`) => `void`

Open the wallet connection modal

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

### setError()

> **setError**: (`store`, `context`, `error?`) => `void`

Set error state for a specific context

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### context

`string`

##### error?

###### category

`"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

###### cause?

`unknown` = `...`

Underlying cause of the error

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"` = `...`

Error classification for recovery purposes

###### code

`string` = `...`

Error code identifier

###### data?

`Record`\<`string`, `unknown`\> = `...`

Additional error data

###### maxRetries?

`number` = `...`

Maximum number of retry attempts

###### message

`string` = `...`

Human-readable error message

###### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"` = `...`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

###### retryDelay?

`number` = `...`

Retry delay in milliseconds (for retry strategies)

#### Returns

`void`

### setLoading()

> **setLoading**: (`store`, `context`, `loading`) => `void`

Set loading state for a specific context

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### context

keyof [`LoadingState`](../interfaces/LoadingState.md)

##### loading

`boolean`

#### Returns

`void`

### setModalLoading()

> **setModalLoading**: (`store`, `loading`) => `void`

Set global modal loading state (convenience method)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### loading

`boolean`

#### Returns

`void`

### setSessionError()

> **setSessionError**: (`store`, `error?`) => `void`

Set session error (convenience method)

Stores a session-related error in the UI state. This error will be
detected by the useSessionError hook in modal-react.

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### error?

###### category

`"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

###### cause?

`unknown` = `...`

Underlying cause of the error

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"` = `...`

Error classification for recovery purposes

###### code

`string` = `...`

Error code identifier

###### data?

`Record`\<`string`, `unknown`\> = `...`

Additional error data

###### maxRetries?

`number` = `...`

Maximum number of retry attempts

###### message

`string` = `...`

Human-readable error message

###### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"` = `...`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

###### retryDelay?

`number` = `...`

Retry delay in milliseconds (for retry strategies)

#### Returns

`void`

### setSwitchingChainData()

> **setSwitchingChainData**: (`store`, `data?`) => `void`

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

### setTargetChainType()

> **setTargetChainType**: (`store`, `chainType?`) => `void`

Set target chain type for wallet filtering

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### chainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

### setUIError()

> **setUIError**: (`store`, `error?`) => `void`

Set UI error (convenience method)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### error?

###### category

`"user"` \| `"wallet"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"` = `errorCategorySchema`

Error category

###### cause?

`unknown` = `...`

Underlying cause of the error

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"` = `...`

Error classification for recovery purposes

###### code

`string` = `...`

Error code identifier

###### data?

`Record`\<`string`, `unknown`\> = `...`

Additional error data

###### maxRetries?

`number` = `...`

Maximum number of retry attempts

###### message

`string` = `...`

Human-readable error message

###### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"` = `...`

Recovery strategy for this error
- 'retry': Can be retried immediately
- 'wait_and_retry': Should wait before retrying
- 'manual_action': Requires user intervention
- 'none': Not recoverable (fatal error)
- undefined: Not recoverable (default)

###### retryDelay?

`number` = `...`

Retry delay in milliseconds (for retry strategies)

#### Returns

`void`

### setView()

> **setView**: (`store`, `view`) => `void`

Set the current modal view

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### view

[`ModalView`](../type-aliases/ModalView.md)

#### Returns

`void`

### setWalletFilter()

> **setWalletFilter**: (`store`, `filter`) => `void`

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

### startDiscovery()

> **startDiscovery**: (`store`) => `void`

Start wallet discovery scan

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### stopDiscovery()

> **stopDiscovery**: (`store`) => `void`

Stop wallet discovery scan

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`
