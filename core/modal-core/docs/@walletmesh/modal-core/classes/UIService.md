[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / UIService

# Class: UIService

UI service for managing UI state and display logic

## Constructors

### Constructor

> **new UIService**(`dependencies`, `config`): `UIService`

#### Parameters

##### dependencies

[`UIServiceDependencies`](../interfaces/UIServiceDependencies.md)

##### config

[`UIServiceConfig`](../interfaces/UIServiceConfig.md) = `{}`

#### Returns

`UIService`

## Methods

### closeModal()

> **closeModal**(): `void`

Close modal

#### Returns

`void`

***

### getConnectButtonContent()

> **getConnectButtonContent**(`state`, `session?`, `options?`): [`ConnectButtonContent`](../interfaces/ConnectButtonContent.md)

Get connect button content based on current state

#### Parameters

##### state

[`ConnectButtonState`](../type-aliases/ConnectButtonState.md)

##### session?

[`SessionInfo`](../interfaces/SessionInfo.md)

##### options?

[`ConnectButtonOptions`](../interfaces/ConnectButtonOptions.md) = `{}`

#### Returns

[`ConnectButtonContent`](../interfaces/ConnectButtonContent.md)

***

### getConnectionFlags()

> **getConnectionFlags**(`status`): [`ConnectionFlags`](../interfaces/ConnectionFlags.md)

Get connection flags for UI logic

#### Parameters

##### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

#### Returns

[`ConnectionFlags`](../interfaces/ConnectionFlags.md)

***

### getConnectionInfo()

> **getConnectionInfo**(`session?`, `options?`): [`UIConnectionInfo`](../interfaces/UIConnectionInfo.md)

Get connection info for UI display

#### Parameters

##### session?

[`SessionInfo`](../interfaces/SessionInfo.md)

##### options?

[`ConnectionDisplayOptions`](../interfaces/ConnectionDisplayOptions.md) = `{}`

#### Returns

[`UIConnectionInfo`](../interfaces/UIConnectionInfo.md)

***

### getSimpleButtonContent()

> **getSimpleButtonContent**(`status`, `options`): [`SimpleConnectButtonContent`](../../../internal/types/typedocExports/interfaces/SimpleConnectButtonContent.md)

Get simple connect button content

#### Parameters

##### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

##### options

[`SimpleConnectButtonOptions`](../../../internal/types/typedocExports/interfaces/SimpleConnectButtonOptions.md) = `{}`

#### Returns

[`SimpleConnectButtonContent`](../../../internal/types/typedocExports/interfaces/SimpleConnectButtonContent.md)

***

### getUIState()

> **getUIState**(): [`UIState`](../interfaces/UIState.md)

Get current UI state from store

#### Returns

[`UIState`](../interfaces/UIState.md)

***

### navigateToView()

> **navigateToView**(`view`): `void`

Navigate to a view

#### Parameters

##### view

`"connecting"` | `"connected"` | `"error"` | `"wallet-selection"` | `"account-details"`

#### Returns

`void`

***

### openModal()

> **openModal**(): `void`

Open modal

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Reset UI state

#### Returns

`void`

***

### setConnectionProgress()

> **setConnectionProgress**(`progress`): `void`

Set connection progress

#### Parameters

##### progress

`number`

#### Returns

`void`

***

### setError()

> **setError**(`error`): `void`

Set error message

#### Parameters

##### error

`undefined` | `string`

#### Returns

`void`

***

### setLoading()

> **setLoading**(`isLoading`, `message?`): `void`

Set loading state

#### Parameters

##### isLoading

`boolean`

##### message?

`string`

#### Returns

`void`

***

### setSelectedWallet()

> **setSelectedWallet**(`wallet`): `void`

Set selected wallet

#### Parameters

##### wallet

`undefined` | [`WalletInfo`](../interfaces/WalletInfo.md)

#### Returns

`void`
