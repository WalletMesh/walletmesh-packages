[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ssrState

# Variable: ssrState

> `const` **ssrState**: `object`

SSR state serialization

Serialize modal state for hydration

## Type Declaration

### deserialize()

> **deserialize**: (`serialized`) => [`HeadlessModalState`](../interfaces/HeadlessModalState.md)

Deserialize state from SSR

#### Parameters

##### serialized

`string`

#### Returns

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

### extractSafeState()

> **extractSafeState**: (`state`) => [`HeadlessModalState`](../interfaces/HeadlessModalState.md)

Extract safe state for SSR (no functions or browser-specific data)

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

### serialize()

> **serialize**: (`state`) => `string`

Serialize state for SSR

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`string`
