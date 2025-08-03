[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / ReceiveErrorHandlerConfig

# Interface: ReceiveErrorHandlerConfig

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L85)

Configuration for the receive error handler

## Properties

### disableThrottling?

> `optional` **disableThrottling**: `boolean`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L105)

Disable circuit breaker check throttling (for testing)

***

### emitErrorEvents?

> `optional` **emitErrorEvents**: `boolean`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L97)

Whether to emit error events

***

### errorRateWindow?

> `optional` **errorRateWindow**: `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L101)

Time window for error rate calculation (ms)

***

### globalHandler?

> `optional` **globalHandler**: [`ReceiveErrorHandlerFunction`](../type-aliases/ReceiveErrorHandlerFunction.md)

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L89)

Global error handler (called for all errors)

***

### handlers?

> `optional` **handlers**: `Partial`\<`Record`\<[`ReceiveErrorCategory`](../enumerations/ReceiveErrorCategory.md), [`ReceiveErrorHandlerFunction`](../type-aliases/ReceiveErrorHandlerFunction.md)\>\>

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L87)

Custom error handlers by category

***

### logger()?

> `optional` **logger**: (`message`, `data?`) => `void`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L95)

Custom logger function

#### Parameters

##### message

`string`

##### data?

`unknown`

#### Returns

`void`

***

### logToConsole?

> `optional` **logToConsole**: `boolean`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L93)

Whether to log errors to console

***

### maxErrorRate?

> `optional` **maxErrorRate**: `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L99)

Maximum error rate before circuit breaker activates

***

### recoveryStrategy?

> `optional` **recoveryStrategy**: `Partial`\<[`ErrorRecoveryStrategy`](ErrorRecoveryStrategy.md)\>

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L91)

Error recovery strategy

***

### timeSource()?

> `optional` **timeSource**: () => `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L103)

Custom time source for testing (defaults to Date.now)

#### Returns

`number`
