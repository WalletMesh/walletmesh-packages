[**@walletmesh/jsonrpc v0.5.3**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / ReceiveErrorHandler

# Class: ReceiveErrorHandler

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:122](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L122)

Enhanced receive error handler for JSONRPCNode

## Constructors

### Constructor

> **new ReceiveErrorHandler**(`config`): `ReceiveErrorHandler`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:130](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L130)

#### Parameters

##### config

[`ReceiveErrorHandlerConfig`](../interfaces/ReceiveErrorHandlerConfig.md) = `{}`

#### Returns

`ReceiveErrorHandler`

## Methods

### clearHistory()

> **clearHistory**(): `void`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:427](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L427)

Clear error history

#### Returns

`void`

***

### getErrorStats()

> **getErrorStats**(): `object`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:371](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L371)

Get error statistics

#### Returns

`object`

##### circuitBreakerOpen

> **circuitBreakerOpen**: `boolean`

##### errorsByCategory

> **errorsByCategory**: `Record`\<[`ReceiveErrorCategory`](../enumerations/ReceiveErrorCategory.md), `number`\>

##### errorsBySeverity

> **errorsBySeverity**: `Record`\<[`ErrorSeverity`](../enumerations/ErrorSeverity.md), `number`\>

##### recentErrors

> **recentErrors**: [`ReceiveErrorEvent`](../interfaces/ReceiveErrorEvent.md)[]

##### totalErrors

> **totalErrors**: `number`

***

### handleError()

> **handleError**(`error`, `rawMessage`, `context?`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:281](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L281)

Handle a receive error

#### Parameters

##### error

`unknown`

##### rawMessage

`unknown`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`void`\>

***

### registerHandler()

> **registerHandler**(`category`, `handler`): () => `void`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:406](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L406)

Register an error handler for a specific category

#### Parameters

##### category

[`ReceiveErrorCategory`](../enumerations/ReceiveErrorCategory.md)

##### handler

[`ReceiveErrorHandlerFunction`](../type-aliases/ReceiveErrorHandlerFunction.md)

#### Returns

> (): `void`

##### Returns

`void`

***

### enhanceNode()

> `static` **enhanceNode**(`node`, `config?`): `object`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:436](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L436)

Create an enhanced JSONRPCNode with improved error handling

#### Parameters

##### node

`any`

##### config?

[`ReceiveErrorHandlerConfig`](../interfaces/ReceiveErrorHandlerConfig.md)

#### Returns

`object`

##### errorHandler

> **errorHandler**: `ReceiveErrorHandler`

##### node

> **node**: `any`
