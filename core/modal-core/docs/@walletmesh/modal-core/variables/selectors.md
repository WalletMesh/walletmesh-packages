[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / selectors

# Variable: selectors

> `const` **selectors**: `object`

Combined selectors for common use cases

## Type Declaration

### filterWalletsByChain()

> **filterWalletsByChain**: (`wallets`, `chainType`) => [`WalletInfo`](../interfaces/WalletInfo.md)[]

Filter wallets by chain type

#### Parameters

##### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

### getConnectedWallet()

> **getConnectedWallet**: (`state`, `wallets`) => `null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Get connected wallet info

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

##### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

#### Returns

`null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

### getError()

> **getError**: (`state`) => `unknown`

Get full error object

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`unknown`

### getErrorMessage()

> **getErrorMessage**: (`state`) => `null` \| `string`

Get error message

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`null` \| `string`

### getStateSummary()

> **getStateSummary**: (`state`) => `object`

Get complete modal state summary

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`object`

##### hasError

> **hasError**: `boolean`

##### isConnected

> **isConnected**: `boolean`

##### isConnecting

> **isConnecting**: `boolean`

##### isModalOpen

> **isModalOpen**: `boolean`

### hasError()

> **hasError**: (`state`) => `boolean`

Check if there's an error

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`

### isConnected()

> **isConnected**: (`state`) => `boolean`

Check if wallet is connected

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`

### isConnecting()

> **isConnecting**: (`state`) => `boolean`

Check if wallet is connecting

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`

### isDisconnected()

> **isDisconnected**: (`state`) => `boolean`

Check if wallet is disconnected

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`

### isLoading()

> **isLoading**: (`state`) => `boolean`

Check if UI is loading

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`

### isModalOpen()

> **isModalOpen**: (`state`) => `boolean`

Check if modal is open

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`
