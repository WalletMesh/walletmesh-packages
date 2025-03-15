# Transport Layer Documentation

The Transport layer provides a standardized way to handle bidirectional communication between dApps and wallet extensions. It focuses solely on the mechanics of data transmission, leaving protocol interpretation to higher layers.

## Overview

The Transport layer offers a consistent interface for establishing connections and transmitting data, with implementations for different communication methods:

- ChromeExtensionTransport: For communicating with browser extensions via the Chrome runtime API
- WebSocketTransport: For WebSocket-based communication

## Usage

```typescript
import { ChromeExtensionTransport, WebSocketTransport } from "@walletmesh/modal-core";

// Chrome Extension Transport
const extensionTransport = new ChromeExtensionTransport({
  extensionId: "your-extension-id",
  timeout: 5000,      // Optional: Connection timeout (default: 5000ms)
  retries: 3,         // Optional: Reconnection attempts (default: 3)
  retryDelay: 1000    // Optional: Delay between retries (default: 1000ms)
});

// WebSocket Transport
const wsTransport = new WebSocketTransport({
  url: "wss://your-server.com",
  protocols: ["v1"],  // Optional: WebSocket protocols
  timeout: 5000,      // Optional: Connection timeout (default: 5000ms)
  retries: 3,         // Optional: Reconnection attempts (default: 3)
  retryDelay: 1000    // Optional: Delay between retries (default: 1000ms)
});

// Initialize and connect
await transport.initialize();
await transport.connect();

// Set up message handler
transport.onMessage = (data) => {
  console.log("Received:", data);
};

// Send data
await transport.send({ type: "request", method: "getAccounts" });

// Disconnect when done
await transport.disconnect();
```

## Transport Interface

The Transport interface provides a consistent API across all implementations:

```typescript
interface Transport {
  readonly isConnected: boolean;
  onMessage: ((data: unknown) => void) | null;
  
  initialize(): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send(data: unknown): Promise<void>;
}
```

## Error Handling

Transports throw `TransportError` instances with specific error codes:

```typescript
enum TransportErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  SEND_FAILED = 'SEND_FAILED',
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  TIMEOUT = 'TIMEOUT',
  INVALID_STATE = 'INVALID_STATE'
}
```

## Implementing Custom Transports

To create a custom transport:

1. Implement the Transport interface
2. Handle connection lifecycle (initialize, connect, disconnect)
3. Manage connection state
4. Implement data transmission
5. Handle error cases appropriately

Example skeleton:

```typescript
class CustomTransport implements Transport {
  public onMessage: ((data: unknown) => void) | null = null;
  public isConnected = false;

  async initialize(): Promise<void> {
    // Initialize your transport
  }

  async connect(): Promise<void> {
    // Establish connection
  }

  async disconnect(): Promise<void> {
    // Clean up connection
  }

  async send(data: unknown): Promise<void> {
    // Send data through your transport
  }
}
```

## Security Considerations

1. Data Validation
   - Always validate incoming data before processing
   - Use strict type checking for message handlers
   - Sanitize data before transmission

2. Connection Security
   - Use secure protocols (e.g., wss:// for WebSockets)
   - Implement proper origin checking
   - Handle connection errors gracefully

3. Error Handling
   - Never expose sensitive information in error messages
   - Implement proper timeout handling
   - Handle reconnection attempts securely

4. State Management
   - Track connection state accurately
   - Clean up resources on disconnection
   - Prevent data transmission in invalid states
