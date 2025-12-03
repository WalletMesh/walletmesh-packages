[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / HeadlessModal

# Interface: HeadlessModal

Headless modal interface - pure business logic without UI

## Methods

### destroy()

> **destroy**(): `void`

Destroy the modal and clean up resources

#### Returns

`void`

***

### getActions()

> **getActions**(): [`HeadlessModalActions`](HeadlessModalActions.md)

Get available actions

#### Returns

[`HeadlessModalActions`](HeadlessModalActions.md)

***

### getState()

> **getState**(): [`HeadlessModalState`](HeadlessModalState.md)

Get current state

#### Returns

[`HeadlessModalState`](HeadlessModalState.md)

***

### subscribe()

> **subscribe**(`listener`): () => `void`

Subscribe to state changes

#### Parameters

##### listener

(`state`) => `void`

#### Returns

> (): `void`

##### Returns

`void`
