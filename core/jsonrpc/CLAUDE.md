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
   - Methods and Properties:
     - `context`: Public readonly property holding the shared context object.
     - `registerMethod()`: Register a method handler.
     - `registerSerializer()`: Register a custom serializer for a method's parameters and/or result.
     - `callMethod()`: Call a remote method with optional parameters and timeout.
     - `notify()`: Send a notification (a request expecting no response).
     - `on()`: Register an event handler for a specific event name.
     - `emit()`: Emit an event to the remote end.
     - `addMiddleware()`: Add a middleware function to the request processing chain.
     - `receiveMessage()`: Process an incoming message from the transport (automatically called by the node via `transport.onMessage`).
     - `setFallbackHandler()`: Register a handler for methods not explicitly registered.
     - `close()`: Clean up resources, remove handlers/middleware, and reject pending requests.
   - Orchestrates all other components

2. **Component Managers**
   - `MethodManager` (`src/method-manager.ts`):
     - Registers method handlers (`registerMethod`) and fallback handlers (`setFallbackHandler`).
     - Manages method invocation, including handling pending requests and responses.
     - Utilizes `ParameterSerializer` for deserializing parameters and serializing results, supporting custom method-specific serializers (`registerSerializer`).

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

3. **JSONRPCProxy** (`src/proxy.ts`)
   - Transparent message forwarding proxy for JSON-RPC communication
   - Key Features:
     - Request/response correlation with unique IDs
     - Configurable timeouts with automatic cleanup
     - Health monitoring and statistics tracking
     - Transparent pass-through of notifications and events
   - Methods:
     - `forward()`: Forward a message and await response
     - `close()`: Clean up pending requests

4. **Error Handling** (`src/error.ts`)
   - `JSONRPCError`: Standard-compliant error class with error codes
     - Standard error codes: -32700 (Parse error), -32600 (Invalid Request), etc.
     - Custom error codes in -32000 to -32099 range
   - `TimeoutError`: Specialized error for request timeouts
   - Proper error serialization for protocol compliance

5. **Message Validation** (`src/message-validator.ts`)
   - Validates JSON-RPC message structure
   - Checks required fields: jsonrpc, method, id, etc.
   - Ensures protocol version compliance (2.0)

6. **Parameter Serialization** (`src/parameter-serializer.ts`)
   - Handles serialization of complex objects
   - Supports custom serializers for complex types
   - Separates param and result serialization

7. **Type System** (`src/types.ts`)
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

type MyContext = { // Optional: Define a context type
  userId?: string;
  customData?: number;
};

// Implement a transport (e.g., using a WebSocket-like object 'ws')
// JSONRPCTransport is defined in src/types.ts
const transport: JSONRPCTransport = {
  send: async (message) => {
    // In a real app, send to the other party (e.g., via WebSocket)
    // ws.send(JSON.stringify(message));
    console.log('Sending message:', message); // Placeholder for actual send
  },
  onMessage: (callback) => {
    // Set up message reception from the other party
    // ws.on('message', (data) => callback(JSON.parse(data.toString())));
    // Example: Simulate receiving a message
    // setTimeout(() => callback({ jsonrpc: '2.0', event: 'notification', params: { message: 'Hello from transport' } }), 1000);
    console.log('onMessage callback registered by JSONRPCNode.'); // Placeholder
  }
};

// Create a JSONRPCNode instance with the transport and optional initial context
const node = new JSONRPCNode<MethodMap, EventMap, MyContext>(transport, { customData: 42 });
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
    serialize: async (method, date) => { // Mark as async
      if (!(date instanceof Date)) {
        throw new JSONRPCError(-32602, 'Invalid date parameter');
      }
      return { serialized: date.toISOString(), method };
    },
    deserialize: async (data, method) => { // Mark as async
      return new Date(data.serialized);
    }
  },
  result: {
    serialize: async (method, date) => { // Mark as async
      // Ensure result is also a Date for this example, or adjust types
      if (!(date instanceof Date)) {
         throw new JSONRPCError(-32603, 'Invalid date result for serialization');
      }
      return { serialized: date.toISOString(), method };
    },
    deserialize: async (data, method) => { // Mark as async
      return new Date(data.serialized);
    }
  }
};

// Register serializer for a specific method
node.registerSerializer('processDate', dateSerializer);
```

### Working with JSONRPCProxy

The JSONRPCProxy provides transparent message forwarding between JSON-RPC nodes without serialization/deserialization overhead:

```typescript
// Create a proxy with configuration
const proxy = new JSONRPCProxy(transport, {
  chainId: 'eip155:1',
  timeoutMs: 30000,
  debug: true,
  logger: (msg, data) => console.log(`[Proxy eip155:1] ${msg}`, data)
});

// Forward a request and wait for response
const request = {
  jsonrpc: '2.0',
  method: 'eth_accounts',
  id: 'req-123'
};

try {
  const response = await proxy.forward(request);
  console.log('Response:', response);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Request timed out');
  }
}

// Clean up when done
proxy.close();
```

## Transport Layer and `JSONRPCTransport` Interface

The library is transport-agnostic. The `JSONRPCNode` interacts with a user-provided transport layer that must implement the `JSONRPCTransport` interface. This interface defines how messages are sent and how the node subscribes to incoming messages.

### `JSONRPCTransport` Interface Definition
```typescript
interface JSONRPCTransport {
  /**
   * Sends a JSON-RPC message to the remote node.
   * The implementation should handle message serialization (if necessary, though
   * JSONRPCNode sends already stringifiable objects) and delivery.
   *
   * @param message - The JSON-RPC message object to send.
   * @returns A promise that resolves when the message has been sent or queued.
   * @throws {Error} If message delivery fails (e.g., connection lost).
   */
  send(message: unknown): Promise<void>;

  /**
   * Registers a callback to receive messages from the remote node.
   * The JSONRPCNode will call this method once during its initialization to set up
   * its listener for incoming messages. The transport implementation should invoke
   * the provided callback whenever a complete message is received from the remote side.
   *
   * @param callback - Function to call with the received message data.
   *                   The transport should pass the raw message object (typically after JSON.parse).
   */
  onMessage(callback: (message: unknown) => void): void;
}
```

### Key Characteristics:
- **Bidirectional**: The transport must support sending messages (`send`) and allow the `JSONRPCNode` to register a listener for incoming messages (`onMessage`).
- **Node Integration**: The `JSONRPCNode` automatically connects to the transport during its initialization by calling the `onMessage` method and providing its internal message handling callback. This setup ensures automatic processing of incoming messages without requiring manual calls to a `receiveMessage` method on the node from the transport side.
- **Flexibility**: This design separates protocol logic from transport concerns, allowing `JSONRPCNode` to work with various communication mechanisms, such as:
    1.  **Browser `postMessage`**: For cross-origin iframe or extension communication.
    2.  **WebSockets**: For real-time, persistent client-server or peer-to-peer connections.
    3.  **HTTP**: For request-response patterns, though bi-directional events would require more complex HTTP handling (e.g., long polling, server-sent events) or a separate channel.
    4.  **Custom Transports**: Any system capable of message-based send/receive operations.
- **Message Format**: The `JSONRPCNode` sends JavaScript objects that are ready for `JSON.stringify()` to the `transport.send()` method. The `transport.onMessage()` callback should provide the `JSONRPCNode` with JavaScript objects (typically after `JSON.parse()` on the raw incoming data).

## Error Handling Best Practices

### Basic Error Handling
- Use `JSONRPCError` for standard-compliant errors
- Include detailed error data for client diagnostics
- Handle timeout errors explicitly
- Implement proper error recovery strategies

### Enhanced Error Handling (New)
The package now includes an enhanced error handling system for receive errors:

#### Built-in Enhanced Error Handling
As of the latest version, `JSONRPCNode` includes improved error handling by default:
- **Error categorization**: Parse, Validation, Method, Transport, Unknown
- **Severity levels**: Low, Medium, High, Critical
- **Recovery suggestions**: Actionable guidance for each error type
- **Appropriate logging**: Debug for low, warn for medium, error for high/critical

#### Advanced Error Handling with `ReceiveErrorHandler`
For more sophisticated error handling, use the `ReceiveErrorHandler` class:

```typescript
import { ReceiveErrorHandler, ReceiveErrorCategory } from '@walletmesh/jsonrpc';

// Enhance existing node
const { node, errorHandler } = ReceiveErrorHandler.enhanceNode(existingNode, {
  globalHandler: async (event) => {
    // Custom handling for all errors
    await logToMonitoring(event);
  },
  handlers: {
    [ReceiveErrorCategory.TRANSPORT]: async (event) => {
      // Handle transport errors specifically
      if (event.severity === 'HIGH') {
        await attemptReconnection();
      }
    },
  },
  maxErrorRate: 10,
  errorRateWindow: 60000,
});

// Get error statistics
const stats = errorHandler.getErrorStats();
console.log('Circuit breaker active:', stats.circuitBreakerOpen);
```

#### Error Categories and Recovery Actions
- **PARSE**: Malformed JSON → "Validate message format before processing"
- **VALIDATION**: Invalid JSON-RPC → "Check JSON-RPC message structure and required fields"  
- **METHOD**: Method errors → "Register the missing method handler" or "Review method implementation"
- **TRANSPORT**: Connection issues → "Check transport connection and retry"
- **UNKNOWN**: Unexpected errors → "Investigate unexpected error and add proper handling"

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
