[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / ReceiveErrorEvent

# Interface: ReceiveErrorEvent

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L44)

Receive error event with detailed context

## Properties

### category

> **category**: [`ReceiveErrorCategory`](../enumerations/ReceiveErrorCategory.md)

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L46)

Error category

***

### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L56)

Optional additional context

***

### error

> **error**: `Error`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L50)

Original error

***

### rawMessage

> **rawMessage**: `unknown`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L52)

Raw message that caused the error

***

### recoveryAction?

> `optional` **recoveryAction**: `string`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L58)

Suggested recovery action

***

### severity

> **severity**: [`ErrorSeverity`](../enumerations/ErrorSeverity.md)

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L48)

Error severity

***

### timestamp

> **timestamp**: `number`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L54)

Timestamp of the error
