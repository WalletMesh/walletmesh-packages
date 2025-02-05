[**@walletmesh/jsonrpc v0.4.0**](README.md)

***

# @walletmesh/jsonrpc v0.4.0

JSON-RPC 2.0 implementation with bi-directional communication support.
This module provides a complete implementation of the JSON-RPC 2.0 specification
with additional features for bi-directional communication, middleware support,
and type safety.

Key exports:
- [JSONRPCNode](classes/JSONRPCNode.md) - Main class for JSON-RPC communication
- [JSONRPCError](classes/JSONRPCError.md) - Error handling
- Type definitions for method maps, events, and context
- Utility functions for validation and type checking

## Classes

- [JSONRPCError](classes/JSONRPCError.md)
- [JSONRPCNode](classes/JSONRPCNode.md)
- [TimeoutError](classes/TimeoutError.md)

## Interfaces

- [JSONRPCErrorInterface](interfaces/JSONRPCErrorInterface.md)
- [JSONRPCEvent](interfaces/JSONRPCEvent.md)
- [JSONRPCEventMap](interfaces/JSONRPCEventMap.md)
- [JSONRPCMethodDef](interfaces/JSONRPCMethodDef.md)
- [JSONRPCMethodMap](interfaces/JSONRPCMethodMap.md)
- [JSONRPCRequest](interfaces/JSONRPCRequest.md)
- [JSONRPCResponse](interfaces/JSONRPCResponse.md)
- [JSONRPCSerializer](interfaces/JSONRPCSerializer.md)
- [JSONRPCTransport](interfaces/JSONRPCTransport.md)
- [Serializer](interfaces/Serializer.md)

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

## Functions

- [applyToMethods](functions/applyToMethods.md)
- [isJSONRPCID](functions/isJSONRPCID.md)
- [isJSONRPCSerializedData](functions/isJSONRPCSerializedData.md)
- [isJSONRPCVersion](functions/isJSONRPCVersion.md)
- [wrapHandler](functions/wrapHandler.md)
