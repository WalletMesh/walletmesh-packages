[**@walletmesh/jsonrpc v0.5.3**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / ErrorRecoveryStrategy

# Interface: ErrorRecoveryStrategy

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L69)

Error recovery strategy

## Properties

### backoffMultiplier

> **backoffMultiplier**: `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L73)

Backoff multiplier for retries

***

### disconnectOnCritical

> **disconnectOnCritical**: `boolean`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L79)

Whether to disconnect on critical errors

***

### initialRetryDelay

> **initialRetryDelay**: `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L75)

Initial retry delay in ms

***

### maxRetries

> **maxRetries**: `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L71)

Maximum retry attempts

***

### maxRetryDelay

> **maxRetryDelay**: `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L77)

Maximum retry delay in ms
