[**@walletmesh/jsonrpc v0.5.3**](README.md)

***

# @walletmesh/jsonrpc v0.5.3

JSON-RPC 2.0 implementation with bi-directional communication support.
This module provides a complete implementation of the JSON-RPC 2.0 specification
with additional features for bi-directional communication, middleware support,
and type safety.

Key exports:
- [JSONRPCNode](classes/JSONRPCNode.md) - Main class for JSON-RPC communication
- [JSONRPCError](classes/JSONRPCError.md) - Error handling
- Type definitions for method maps, events, and context
- Utility functions for validation and type checking

## Enumerations

- [ErrorSeverity](enumerations/ErrorSeverity.md)
- [ReceiveErrorCategory](enumerations/ReceiveErrorCategory.md)

## Classes

- [JSONRPCError](classes/JSONRPCError.md)
- [JSONRPCNode](classes/JSONRPCNode.md)
- [JSONRPCProxy](classes/JSONRPCProxy.md)
- [ReceiveErrorHandler](classes/ReceiveErrorHandler.md)
- [TimeoutError](classes/TimeoutError.md)

## Interfaces

- [ErrorRecoveryStrategy](interfaces/ErrorRecoveryStrategy.md)
- [JSONRPCErrorInterface](interfaces/JSONRPCErrorInterface.md)
- [JSONRPCEvent](interfaces/JSONRPCEvent.md)
- [JSONRPCEventMap](interfaces/JSONRPCEventMap.md)
- [JSONRPCMethodDef](interfaces/JSONRPCMethodDef.md)
- [JSONRPCMethodMap](interfaces/JSONRPCMethodMap.md)
- [JSONRPCProxyConfig](interfaces/JSONRPCProxyConfig.md)
- [JSONRPCRequest](interfaces/JSONRPCRequest.md)
- [JSONRPCResponse](interfaces/JSONRPCResponse.md)
- [JSONRPCSerializer](interfaces/JSONRPCSerializer.md)
- [JSONRPCTransport](interfaces/JSONRPCTransport.md)
- [ReceiveErrorEvent](interfaces/ReceiveErrorEvent.md)
- [ReceiveErrorHandlerConfig](interfaces/ReceiveErrorHandlerConfig.md)
- [Serializer](interfaces/Serializer.md)
- [TransportContext](interfaces/TransportContext.md)

## Type Aliases

- [FallbackMethodHandler](type-aliases/FallbackMethodHandler.md)
- [JSONRPCContext](type-aliases/JSONRPCContext.md)
- [JSONRPCEventHandler](type-aliases/JSONRPCEventHandler.md)
- [JSONRPCID](type-aliases/JSONRPCID.md)
- [JSONRPCMiddleware](type-aliases/JSONRPCMiddleware.md)
- [JSONRPCParams](type-aliases/JSONRPCParams.md)
- [JSONRPCSerializedData](type-aliases/JSONRPCSerializedData.md)
- [MethodHandler](type-aliases/MethodHandler.md)
- [MethodResponse](type-aliases/MethodResponse.md)
- [ReceiveErrorHandlerFunction](type-aliases/ReceiveErrorHandlerFunction.md)

## Functions

- [applyToMethods](functions/applyToMethods.md)
- [createTransportContextMiddleware](functions/createTransportContextMiddleware.md)
- [isJSONRPCID](functions/isJSONRPCID.md)
- [isJSONRPCSerializedData](functions/isJSONRPCSerializedData.md)
- [isJSONRPCVersion](functions/isJSONRPCVersion.md)
- [wrapHandler](functions/wrapHandler.md)
