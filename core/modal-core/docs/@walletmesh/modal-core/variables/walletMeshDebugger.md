[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / walletMeshDebugger

# Variable: walletMeshDebugger

> `const` **walletMeshDebugger**: `object`

## Type Declaration

### error()

> **error**: (`message`, `error?`) => `void`

#### Parameters

##### message

`string`

##### error?

`unknown`

#### Returns

`void`

### getDebugInfo()

> **getDebugInfo**: () => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DebugInfo`](../interfaces/DebugInfo.md)\>

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DebugInfo`](../interfaces/DebugInfo.md)\>

### installGlobal()

> **installGlobal**: () => `void`

#### Returns

`void`

### log()

> **log**: (`message`, `data?`) => `void`

#### Parameters

##### message

`string`

##### data?

`unknown`

#### Returns

`void`

### logStateChange()

> **logStateChange**: (`oldState`, `newState`) => `void`

#### Parameters

##### oldState

`Partial`\<[`ModalState`](../type-aliases/ModalState.md)\>

##### newState

`Partial`\<[`ModalState`](../type-aliases/ModalState.md)\>

#### Returns

`void`

### setEnabled()

> **setEnabled**: (`enabled`) => `void`

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

### warn()

> **warn**: (`message`, `data?`) => `void`

#### Parameters

##### message

`string`

##### data?

`unknown`

#### Returns

`void`

### instance

#### Get Signature

> **get** **instance**(): [`WalletMeshDebugger`](../classes/WalletMeshDebugger.md)

##### Returns

[`WalletMeshDebugger`](../classes/WalletMeshDebugger.md)
