# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

The @walletmesh/jsonrpc package is a comprehensive TypeScript implementation of the JSON-RPC 2.0 protocol, designed for building client-server applications with bi-directional communication capabilities.

## Build & Test Commands
- **Build**: `pnpm build`
- **Test**: `pnpm test` (all tests), `pnpm test -- src/path/to/file.test.ts` (single test)
- **Test with watch**: `pnpm test:watch -- src/path/to/file.test.ts`
- **Coverage**: `pnpm coverage`
- **Lint**: `pnpm lint`, `pnpm lint:fix` (auto-fix)
- **Format**: `pnpm format`, `pnpm format:fix` (auto-fix)
- **Type check**: `pnpm type-check` (all files), `pnpm type-check:build` (production files only)
- **Documentation**: `pnpm docs` (generates TypeDoc documentation)

## Architecture

### JSON-RPC 2.0 Protocol

The package implements the JSON-RPC 2.0 protocol which defines:

1. **Message Types**:
   - **Request**: `{jsonrpc: "2.0", method: string, params?: any, id: string|number|null}`
   - **Response**: `{jsonrpc: "2.0", result?: any, error?: {code: number, message: string, data?: any}, id: string|number|null}`
   - **Notification**: `{jsonrpc: "2.0", method: string, params?: any}` (no id)
   - **Event**: Custom extension for bi-directional events `{jsonrpc: "2.0", event: string, params: any}`

2. **Communication Patterns**:
   - **Request-Response**: Client sends request, server responds with result or error
   - **Notification**: One-way message with no expected response
   - **Event**: Asynchronous notifications using custom event field

3. **Error Handling**:
   - Standardized error codes and structures
   - Detailed error information with optional data

### Core Components

1. **JSONRPCNode** (`src/node.ts`)
   - Core class implementing the bi-directional JSON-RPC protocol
   - Methods:
     - `registerMethod()`: Register a method handler
     - `callMethod()`: Call a method with timeout support
     - `notify()`: Send a notification (no response expected)
     - `on()`: Register event handler
     - `emit()`: Emit an event
     - `addMiddleware()`: Add request processing middleware
     - `receiveMessage()`: Process incoming messages
   - Orchestrates all other components

2. **Component Managers**
   - `MethodManager` (`src/method-manager.ts`):
     - Registers method handlers
     - Manages method invocation
     - Handles pending requests and responses
     - Supports method serializers for complex types

   - `EventManager` (`src/event-manager.ts`):
     - Manages event subscription
     - Handles event emission
     - Type-safe event handling

   - `MiddlewareManager` (`src/middleware-manager.ts`):
     - Controls middleware execution chain
     - Handles middleware registration/removal
     - Supports async middleware

   - `RequestHandler` (`src/request-handler.ts`):
     - Processes incoming JSON-RPC requests
     - Validates request structure
     - Invokes appropriate method handlers

3. **Error Handling** (`src/error.ts`)
   - `JSONRPCError`: Standard-compliant error class with error codes
     - Standard error codes: -32700 (Parse error), -32600 (Invalid Request), etc.
     - Custom error codes in -32000 to -32099 range
   - `TimeoutError`: Specialized error for request timeouts
   - Proper error serialization for protocol compliance

4. **Message Validation** (`src/message-validator.ts`)
   - Validates JSON-RPC message structure
   - Checks required fields: jsonrpc, method, id, etc.
   - Ensures protocol version compliance (2.0)

5. **Parameter Serialization** (`src/parameter-serializer.ts`)
   - Handles serialization of complex objects
   - Supports custom serializers for complex types
   - Separates param and result serialization

6. **Type System** (`src/types.ts`)
   - Comprehensive TypeScript type definitions:
     ```typescript
     interface JSONRPCMethodMap {
       [method: string]: {
         params: unknown;
         result: unknown;
       };
     }

     interface JSONRPCEventMap {
       [event: string]: unknown;
     }

     interface JSONRPCContext {
       [key: string]: unknown;
     }
     ```
   - Complete type safety for method parameters and results
   - Type checking for event payloads

## Working with JSONRPCNode

### Basic Setup

```typescript
// Define your method and event types
type MethodMap = {
  add: { params: { a: number; b: number }; result: number };
  greet: { params: { name: string }; result: string };
};

type EventMap = {
  notification: { message: string };
};

// Create a JSONRPCNode instance
const node = new JSONRPCNode<MethodMap, EventMap>({
  send: async message => {
    // Implement your transport layer here
    // e.g., WebSocket.send(JSON.stringify(message))
  }
});
```

### Registering Methods

```typescript
// Register a method with proper error handling
node.registerMethod('add', async (context, { a, b }) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new JSONRPCError(-32602, 'Invalid parameters', {
      expected: { a: 'number', b: 'number' },
      received: { a: typeof a, b: typeof b }
    });
  }
  return a + b;
});
```

### Calling Methods

```typescript
// Call a method with timeout
try {
  const result = await node.callMethod('add', { a: 1, b: 2 }, 5);
  console.log('Result:', result);
} catch (error) {
  if (error instanceof JSONRPCError) {
    console.error(`RPC Error ${error.code}: ${error.message}`);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  }
}
```

### Event Handling

```typescript
// Subscribe to events
const cleanup = node.on('notification', ({ message }) => {
  console.log('Notification:', message);
});

// Emit events
await node.emit('notification', { message: 'Update available' });

// Clean up event handler
cleanup();
```

### Middleware System

Middleware functions allow intercepting and modifying requests/responses:

```typescript
// Add request logging middleware
const cleanupLogging = node.addMiddleware(async (context, request, next) => {
  console.log('Request:', request);

  try {
    const response = await next();
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
});

// Authentication middleware example
const cleanupAuth = node.addMiddleware(async (context, request, next) => {
  if (!context.userId) {
    throw new JSONRPCError(-32600, 'Unauthorized', {
      requiredField: 'userId',
      method: request.method
    });
  }
  return next();
});

// Remove middleware when no longer needed
cleanupLogging();
cleanupAuth();
```

### Serialization for Complex Types

```typescript
// Define serializer for Date objects
const dateSerializer: JSONRPCSerializer<Date, string> = {
  params: {
    serialize: (method, date) => {
      if (!(date instanceof Date)) {
        throw new JSONRPCError(-32602, 'Invalid date parameter');
      }
      return { serialized: date.toISOString(), method };
    },
    deserialize: (data, method) => {
      return new Date(data.serialized);
    }
  },
  result: {
    serialize: (method, date) => {
      return { serialized: date.toISOString(), method };
    },
    deserialize: (data, method) => {
      return new Date(data.serialized);
    }
  }
};

// Register serializer for a specific method
node.registerSerializer('processDate', dateSerializer);
```

## Transport Implementations

The library is transport-agnostic and can work with:

1. **Browser postMessage**:
   - Cross-origin iframe communication
   - Extension messaging

2. **WebSockets**:
   - Real-time bi-directional communication
   - Client-server or peer-to-peer

3. **HTTP**:
   - RESTful endpoints wrapping JSON-RPC
   - Fetch API or XMLHttpRequest

4. **Custom Transports**:
   - Any mechanism that can send/receive JSON messages
   - Must implement the `JSONRPCTransport` interface

## Error Handling Best Practices

- Use `JSONRPCError` for standard-compliant errors
- Include detailed error data for client diagnostics
- Handle timeout errors explicitly
- Implement proper error recovery strategies

## Standard Error Codes

- Parse error (-32700): Invalid JSON received
- Invalid Request (-32600): Invalid Request object
- Method not found (-32601): Method does not exist
- Invalid params (-32602): Invalid method parameters
- Internal error (-32603): Internal JSON-RPC error
- Server error (-32000 to -32099): Implementation-defined errors

## Testing

When testing code using @walletmesh/jsonrpc:

1. **Method Testing**:
   - Test both successful and error paths
   - Verify parameter validation
   - Test result serialization/deserialization

2. **Middleware Testing**:
   - Test middleware chain execution
   - Verify middleware ordering
   - Test error handling in middleware

3. **Event System Testing**:
   - Verify event subscription and emission
   - Test cleanup of event handlers
   - Test multiple subscribers

4. **Error Testing**:
   - Test appropriate error codes
   - Verify error data
   - Test timeout handling

5. **Integration Testing**:
   - Test complete request-response cycle
   - Verify bi-directional communication
   - Test transport integration