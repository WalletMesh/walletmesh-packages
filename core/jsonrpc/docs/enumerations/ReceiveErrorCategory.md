[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / ReceiveErrorCategory

# Enumeration: ReceiveErrorCategory

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:14](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L14)

Error categories for receive errors

## Enumeration Members

### METHOD

> **METHOD**: `"METHOD"`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L20)

Method errors - method not found or execution failure

***

### PARSE

> **PARSE**: `"PARSE"`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:16](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L16)

Parse errors - malformed JSON or invalid message structure

***

### TRANSPORT

> **TRANSPORT**: `"TRANSPORT"`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L22)

Transport errors - communication failures

***

### UNKNOWN

> **UNKNOWN**: `"UNKNOWN"`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L24)

Unknown errors - unexpected failures

***

### VALIDATION

> **VALIDATION**: `"VALIDATION"`

Defined in: [core/jsonrpc/src/error-handling/receiveErrorHandler.ts:18](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/error-handling/receiveErrorHandler.ts#L18)

Validation errors - invalid JSON-RPC format
