[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / BaseProvider

# Interface: BaseProvider

Defined in: core/modal-core/dist/internal/client/types.d.ts:39

Base provider interface with generic constraints
Represents wallet provider implementations
 BaseProvider

## Methods

### on()

> **on**\<`TPayload`\>(`event`, `listener`): `void`

Defined in: core/modal-core/dist/internal/client/types.d.ts:56

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

Defined in: core/modal-core/dist/internal/client/types.d.ts:64

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

> **request**\<`TMethod`, `TParams`, `TResult`\>(`args`): `Promise`\<`TResult`\>

Defined in: core/modal-core/dist/internal/client/types.d.ts:48

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

`Promise`\<`TResult`\>

Promise resolving to the result
