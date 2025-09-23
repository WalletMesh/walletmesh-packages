[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / subscriptions

# Variable: subscriptions

> `const` **subscriptions**: `object`

Re-export unified state management

## Type Declaration

### activeWallet()

> **activeWallet**: () => `object`

#### Returns

`object`

##### subscribe()

> **subscribe**: (`callback`) => () => `void`

###### Parameters

###### callback

(`walletId`) => `void`

###### Returns

> (): `void`

###### Returns

`void`

### availableWallets()

> **availableWallets**: (`callback`) => () => `void`

#### Parameters

##### callback

(`wallets`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

### discovery

> **discovery**: `object`

#### discovery.isScanning()

> **isScanning**: (`callback`) => () => `void`

##### Parameters

###### callback

(`scanning`) => `void`

##### Returns

> (): `void`

###### Returns

`void`

#### discovery.wallets()

> **wallets**: (`callback`) => () => `void`

##### Parameters

###### callback

(`wallets`) => `void`

##### Returns

> (): `void`

###### Returns

`void`

### session()

> **session**: (`walletId`) => `object`

#### Parameters

##### walletId

`string`

#### Returns

`object`

##### subscribe()

> **subscribe**: (`callback`) => () => `void`

###### Parameters

###### callback

(`sessions`) => `void`

###### Returns

> (): `void`

###### Returns

`void`

### sessions()

> **sessions**: () => `object`

#### Returns

`object`

##### subscribe()

> **subscribe**: (`callback`) => () => `void`

###### Parameters

###### callback

(`sessions`) => `void`

###### Returns

> (): `void`

###### Returns

`void`

### ui

> **ui**: `object`

#### ui.error()

> **error**: (`callback`) => () => `void`

##### Parameters

###### callback

(`error`) => `void`

##### Returns

> (): `void`

###### Returns

`void`

#### ui.isOpen()

> **isOpen**: (`callback`) => () => `void`

##### Parameters

###### callback

(`isOpen`) => `void`

##### Returns

> (): `void`

###### Returns

`void`

#### ui.loading()

> **loading**: (`callback`) => () => `void`

##### Parameters

###### callback

(`loading`) => `void`

##### Returns

> (): `void`

###### Returns

`void`

#### ui.view()

> **view**: (`callback`) => () => `void`

##### Parameters

###### callback

(`view`) => `void`

##### Returns

> (): `void`

###### Returns

`void`
