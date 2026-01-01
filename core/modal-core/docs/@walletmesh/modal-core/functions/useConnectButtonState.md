[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / useConnectButtonState

# Function: useConnectButtonState()

> **useConnectButtonState**(`connectionInfo`, `options`): `object`

Hook-like function for getting connect button state and content

This function provides the business logic for connect buttons without
being tied to React. It can be used by any UI framework.

## Parameters

### connectionInfo

#### address?

`null` \| `string`

#### chainId?

`null` \| `string`

#### chainType?

`null` \| [`ChainType`](../enumerations/ChainType.md)

#### isConnected

`boolean`

#### isConnecting

`boolean`

#### wallet?

`null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

### options

#### chainType?

[`ChainType`](../enumerations/ChainType.md)

#### labels?

\{ `connect?`: `string`; `connected?`: `string`; `connecting?`: `string`; \}

#### labels.connect?

`string`

#### labels.connected?

`string`

#### labels.connecting?

`string`

#### showAddress?

`boolean`

#### showChain?

`boolean`

#### showWalletName?

`boolean`

#### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

## Returns

`object`

### action

> **action**: `"none"` \| `"disconnect"` \| `"connect"`

### content

> **content**: [`ConnectButtonContent`](../../../internal/types/typedocExports/interfaces/ConnectButtonContent.md)

### isConnected

> **isConnected**: `boolean`

### isConnecting

> **isConnecting**: `boolean`

### isDisconnected

> **isDisconnected**: `boolean`

### shouldShowConnectionInfo

> **shouldShowConnectionInfo**: `boolean`

### state

> **state**: [`ConnectButtonState`](../../../internal/types/typedocExports/type-aliases/ConnectButtonState.md)
