[**@walletmesh/jsonrpc v0.2.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / Transport

# Interface: Transport

Function type for sending JSON-RPC messages between nodes.
Implement this to provide the actual transport mechanism for message delivery.
The transport layer handles message serialization and delivery between nodes.

## Example

```typescript
// WebSocket transport with reconnection and error handling
const wsTransport: Transport = {
  send: message => {
    if (ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    ws.send(JSON.stringify(message));
  }
};

// postMessage transport with origin validation
const windowTransport: Transport = {
  send: message => {
    if (!targetWindow) {
      throw new Error('Target window not available');
    }
    targetWindow.postMessage(JSON.stringify(message), targetOrigin);
  }
};

// HTTP transport with fetch
const httpTransport: Transport = {
  send: async message => {
    try {
      const response = await fetch('https://api.example.com/jsonrpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(message)
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error('Transport error:', error);
      throw error;
    }
  }
};
```

## Methods

### send()

> **send**(`message`): `void`

Sends a JSON-RPC message to the remote node.
The implementation should handle message serialization and delivery.

#### Parameters

##### message

`unknown`

The message to send. This will be a JSON-RPC request,
                response, or event object that needs to be delivered to
                the remote node.

#### Returns

`void`

#### Throws

If message delivery fails (e.g., connection lost)

#### Defined in

[packages/jsonrpc/src/types.ts:494](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/jsonrpc/src/types.ts#L494)
