[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useConnectButtonState

# Function: useConnectButtonState()

> **useConnectButtonState**(`connectionInfo`, `options?`): `object`

Defined in: core/modal-core/dist/api/ui/connectButton.d.ts:20

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

### options?

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

> **action**: `"connect"` \| `"disconnect"` \| `"none"`

### content

> **content**: `ConnectButtonContent`

### isConnected

> **isConnected**: `boolean`

### isConnecting

> **isConnecting**: `boolean`

### isDisconnected

> **isDisconnected**: `boolean`

### shouldShowConnectionInfo

> **shouldShowConnectionInfo**: `boolean`

### state

> **state**: `ConnectButtonState`
