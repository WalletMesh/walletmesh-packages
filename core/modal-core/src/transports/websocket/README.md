# WebSocket Transport

The WebSocket Transport enables bidirectional communication between dApps and wallets using the WebSocket protocol. This implementation provides reliable data transmission with automatic reconnection capabilities and proper error handling.

## Implementation Details

This transport:
- Implements standard WebSocket protocol with JSON message serialization
- Supports optional subprotocols for versioning or protocol selection
- Handles connection timeouts with configurable duration
- Provides automatic reconnection with configurable retry parameters
- Includes proper cleanup and resource management

## Configuration

```typescript
interface WebSocketTransportConfig {
  /** WebSocket URL to connect to */
  url: string;

  /** Optional WebSocket protocols */
  protocols?: string | string[];

  /** Connection timeout in milliseconds (default: 5000) */
  timeout?: number;

  /** Number of reconnection attempts (default: 3) */
  retries?: number;

  /** Delay between reconnection attempts in milliseconds (default: 1000) */
  retryDelay?: number;
}
```

## Usage Example

```typescript
import { WebSocketTransport } from "@walletmesh/modal-core";

// Basic usage
const transport = new WebSocketTransport({
  url: "wss://wallet.example.com"
});

// With protocol and custom timeouts
const transport = new WebSocketTransport({
  url: "wss://wallet.example.com",
  protocols: ["v1"],
  timeout: 10000,
  retries: 5,
  retryDelay: 2000
});

await transport.initialize();
await transport.connect();

// Set up message handler
transport.onMessage = (data) => {
  console.log("Received:", data);
};

// Send data (automatically JSON serialized)
await transport.send({
  type: "request",
  method: "getAccounts"
});

// Clean up
await transport.disconnect();
```

## Security Considerations

1. Connection Security
   - Always use WSS (WebSocket Secure) in production
   - Consider implementing server-side origin validation
   - Handle connection timeouts to prevent hanging states

2. Message Validation
   - All messages are automatically JSON serialized/deserialized
   - Implement proper message validation on both ends
   - Consider using a schema validation library
   - Handle malformed JSON gracefully

3. Error Handling
   - Connection failures trigger automatic reconnection
   - Configurable retry limits prevent infinite loops
   - Proper cleanup on disconnection
   - Error events include detailed cause information

4. State Management
   - Accurate connection state tracking
   - Automatic resource cleanup
   - Safe reconnection handling

## Server Implementation Guide

When implementing the corresponding WebSocket server:

1. Basic Server Setup
   ```typescript
   import WebSocket from 'ws';

   const wss = new WebSocket.Server({ 
     port: 8080,
     // Consider additional options:
     // - clientTracking: true
     // - maxPayload: 50 * 1024 // 50KB limit
   });

   wss.on('connection', (ws) => {
     ws.on('message', handleMessage);
     ws.on('close', handleDisconnect);
     ws.on('error', handleError);
   });
   ```

2. Message Handling
   ```typescript
   function handleMessage(data: WebSocket.Data) {
     try {
       const message = JSON.parse(data.toString());
       // Process message
     } catch (error) {
       console.error('Failed to parse message:', error);
     }
   }
   ```

3. Connection Management
   ```typescript
   function handleDisconnect() {
     // Clean up resources
     // Update connection tracking
   }

   function handleError(error: Error) {
     console.error('WebSocket error:', error);
     // Implement error logging/monitoring
   }
   ```

4. Heartbeat Implementation
   ```typescript
   const PING_INTERVAL = 30000;

   wss.on('connection', (ws) => {
     ws.isAlive = true;
     ws.on('pong', () => { ws.isAlive = true; });

     // Send periodic pings
     const pingTimer = setInterval(() => {
       if (ws.isAlive === false) {
         clearInterval(pingTimer);
         return ws.terminate();
       }
       ws.isAlive = false;
       ws.ping();
     }, PING_INTERVAL);

     ws.on('close', () => clearInterval(pingTimer));
   });
   ```

## Best Practices

1. Error Recovery
   - Implement exponential backoff for reconnection
   - Set appropriate timeout values
   - Handle network changes gracefully

2. Message Ordering
   - Consider implementing message queuing
   - Track message sequence numbers if needed
   - Handle out-of-order messages appropriately

3. Performance
   - Implement message batching for high-frequency updates
   - Consider compression for large payloads
   - Monitor connection health and performance

4. Testing
   - Test reconnection scenarios
   - Verify timeout handling
   - Simulate various network conditions
   - Test message serialization edge cases
