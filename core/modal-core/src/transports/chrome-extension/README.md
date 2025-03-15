# Chrome Extension Transport

The Chrome Extension Transport enables secure communication between dApps and Chrome extensions using the `chrome.runtime` messaging API.

## Implementation Details

This transport:
- Uses Chrome's port-based messaging system for reliable bidirectional communication
- Implements automatic reconnection with configurable retry parameters
- Handles connection timeouts and disconnection events
- Manages port lifecycle and cleanup

## Configuration

```typescript
interface ChromeExtensionTransportConfig {
  /** ID of the target Chrome extension */
  extensionId: string;
  
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
import { ChromeExtensionTransport } from "@walletmesh/modal-core";

const transport = new ChromeExtensionTransport({
  extensionId: "your-extension-id"
});

await transport.initialize();
await transport.connect();

transport.onMessage = (data) => {
  console.log("Received message:", data);
};

await transport.send({ type: "request", method: "connect" });
```

## Security Considerations

1. Extension Verification
   - Verify the extension ID matches the expected wallet extension
   - Consider implementing additional origin verification
   - Handle extension installation/uninstallation events

2. Message Security
   - Validate all message data before processing
   - Use strict typing for message payloads
   - Implement proper error boundaries

3. State Management
   - Track port connection state accurately
   - Clean up listeners and timeouts on disconnection
   - Handle edge cases like extension updates/reloads

## Common Issues

1. Extension Not Found
   ```typescript
   try {
     await transport.connect();
   } catch (error) {
     if (error.code === 'CONNECTION_FAILED') {
       // Handle missing extension
     }
   }
   ```

2. Connection Timeout
   ```typescript
   const transport = new ChromeExtensionTransport({
     extensionId: "your-extension-id",
     timeout: 10000  // Increase timeout for slow connections
   });
   ```

3. Lost Connection
   ```typescript
   transport.onMessage = null;  // Clear handler
   await transport.disconnect();
   await transport.connect();   // Reconnect
   ```

## Best Practices

1. Error Handling
   - Always catch and handle transport errors
   - Provide meaningful feedback to users
   - Implement graceful fallbacks

2. Resource Management
   - Disconnect transport when not in use
   - Clear message handlers appropriately
   - Handle cleanup in component unmount

3. Connection Management
   - Monitor connection state changes
   - Implement connection recovery logic
   - Handle background/focus events
