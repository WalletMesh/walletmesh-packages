[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMeshDebugger

# Class: WalletMeshDebugger

WalletMesh debugger for development

## Constructors

### Constructor

> **new WalletMeshDebugger**(): `WalletMeshDebugger`

#### Returns

`WalletMeshDebugger`

## Methods

### createDebugReport()

> **createDebugReport**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Create a debug report

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### error()

> **error**(`message`, `error?`): `void`

Log error

#### Parameters

##### message

`string`

##### error?

`unknown`

#### Returns

`void`

***

### exportDebugInfo()

> **exportDebugInfo**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Export debug information as JSON

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### getDebugInfo()

> **getDebugInfo**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DebugInfo`](../interfaces/DebugInfo.md)\>

Get comprehensive debug information

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DebugInfo`](../interfaces/DebugInfo.md)\>

***

### installGlobal()

> **installGlobal**(): `void`

Install global debug helper

#### Returns

`void`

***

### log()

> **log**(`message`, `data?`): `void`

Log debug information

#### Parameters

##### message

`string`

##### data?

`unknown`

#### Returns

`void`

***

### logConnection()

> **logConnection**(`walletId`, `chainType?`): `void`

Log connection attempt

#### Parameters

##### walletId

`string`

##### chainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

***

### logConnectionResult()

> **logConnectionResult**(`result`): `void`

Log connection result

#### Parameters

##### result

[`ConnectionResult`](../interfaces/ConnectionResult.md)

#### Returns

`void`

***

### logStateChange()

> **logStateChange**(`oldState`, `newState`): `void`

Log state change

#### Parameters

##### oldState

`Partial`\<[`ModalState`](../type-aliases/ModalState.md)\>

##### newState

`Partial`\<[`ModalState`](../type-aliases/ModalState.md)\>

#### Returns

`void`

***

### logWalletDetection()

> **logWalletDetection**(`results`): `void`

Log wallet detection results

#### Parameters

##### results

`object`[]

#### Returns

`void`

***

### setEnabled()

> **setEnabled**(`enabled`): `void`

Enable or disable debugging

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### warn()

> **warn**(`message`, `data?`): `void`

Log warning

#### Parameters

##### message

`string`

##### data?

`unknown`

#### Returns

`void`
