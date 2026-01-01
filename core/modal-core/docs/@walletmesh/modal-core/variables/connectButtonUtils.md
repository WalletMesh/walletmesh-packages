[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / connectButtonUtils

# Variable: connectButtonUtils

> `const` **connectButtonUtils**: `object`

Utility functions for connection display

## Type Declaration

### formatAddress()

> **formatAddress**: (`address`, `chainType?`, `options?`) => `string`

Format an address for display

#### Parameters

##### address

`string`

##### chainType?

[`ChainType`](../enumerations/ChainType.md)

##### options?

###### maxLength?

`number`

###### prefixLength?

`number`

###### suffixLength?

`number`

#### Returns

`string`

### formatConnectionInfo()

> **formatConnectionInfo**: (`options`, `displayOptions?`) => `string`

Format connection information

#### Parameters

##### options

###### address?

`null` \| `string`

###### chainId?

`null` \| `string`

###### chainType?

`null` \| [`ChainType`](../enumerations/ChainType.md)

###### walletName?

`null` \| `string`

##### displayOptions?

###### separator?

`string`

###### showAddress?

`boolean`

###### showChain?

`boolean`

###### showWalletName?

`boolean`

#### Returns

`string`

### getChainDisplayName()

> **getChainDisplayName**: (`chainId`, `chainType`) => `string`

Get chain display name

#### Parameters

##### chainId

`string`

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`string`

### getConnectionStatusText()

> **getConnectionStatusText**: (`isConnected`, `isConnecting`, `error?`) => `string`

Get connection status text

#### Parameters

##### isConnected

`boolean`

##### isConnecting

`boolean`

##### error?

`null` | `Error`

#### Returns

`string`

### isValidAddressFormat()

> **isValidAddressFormat**: (`address`, `chainType`) => `boolean`

Validate address format

#### Parameters

##### address

`string`

##### chainType

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`boolean`
