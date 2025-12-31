[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / errorSelectors

# Variable: errorSelectors

> `const` **errorSelectors**: `object`

Error state selectors

## Type Declaration

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

### hasError()

> **hasError**: (`state`) => `boolean`

Check if there's an error

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`
