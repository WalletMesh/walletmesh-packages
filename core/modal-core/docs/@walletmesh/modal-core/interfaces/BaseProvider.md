[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BaseProvider

# Interface: BaseProvider

Base provider interface with generic constraints
Represents wallet provider implementations
 BaseProvider

## Methods

### on()

> **on**\<`TPayload`\>(`event`, `listener`): `void`

Add a type-safe event listener

#### Type Parameters

##### TPayload

`TPayload` = `unknown`

The event payload type

#### Parameters

##### event

`string`

Event name to listen for

##### listener

[`ProviderEventListener`](../type-aliases/ProviderEventListener.md)\<`TPayload`\>

Event handler function

#### Returns

`void`

***

### removeListener()

> **removeListener**\<`TPayload`\>(`event`, `listener`): `void`

Remove a type-safe event listener

#### Type Parameters

##### TPayload

`TPayload` = `unknown`

The event payload type

#### Parameters

##### event

`string`

Event name to remove listener from

##### listener

[`ProviderEventListener`](../type-aliases/ProviderEventListener.md)\<`TPayload`\>

Event handler to remove

#### Returns

`void`

***

### request()

> **request**\<`TMethod`, `TParams`, `TResult`\>(`args`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Type-safe request method for making calls to the provider

#### Type Parameters

##### TMethod

`TMethod` *extends* `string` = `string`

The method name type

##### TParams

`TParams` = `unknown`[]

The parameters type

##### TResult

`TResult` = `unknown`

The expected result type

#### Parameters

##### args

[`ProviderRequest`](ProviderRequest.md)\<`TMethod`, `TParams`\>

Request arguments

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Promise resolving to the result
