[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCTransport

# Interface: JSONRPCTransport

Defined in: [core/jsonrpc/src/types.ts:501](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/jsonrpc/src/types.ts#L501)

Bidirectional transport interface for JSON-RPC communication.
Implement this to provide the actual transport mechanism for message delivery and reception.
The transport layer handles message serialization and delivery between nodes.

## Example

```typescript
// WebSocket transport
const wsTransport: JSONRPCTransport = {
  send: async message => {
    if (ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    ws.send(JSON.stringify(message));
  },
  onMessage: callback => {
    ws.onmessage = event => {
      callback(JSON.parse(event.data));
    };
  }
};

// postMessage transport with origin validation
const windowTransport: JSONRPCTransport = {
  send: async message => {
    if (!targetWindow) {
      throw new Error('Target window not available');
    }
    targetWindow.postMessage(JSON.stringify(message), targetOrigin);
  },
  onMessage: callback => {
    window.addEventListener('message', event => {
      if (event.origin === targetOrigin && event.data) {
        callback(event.data);
      }
    });
  }
};

// HTTP long-polling transport
const httpTransport: JSONRPCTransport = {
  send: async message => {
    await fetch('https://api.example.com/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(message)
    });
  },
  onMessage: callback => {
    const poll = async () => {
      try {
        const response = await fetch('https://api.example.com/jsonrpc/poll');
        const messages = await response.json();
        messages.forEach(callback);
      } catch (error) {
        console.error('Polling error:', error);
      }
      setTimeout(poll, 1000); // Poll every second
    };
    poll();
  }
};
```

## Methods

### onMessage()

> **onMessage**(`callback`): `void`

Defined in: [core/jsonrpc/src/types.ts:522](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/jsonrpc/src/types.ts#L522)

Register a callback to receive messages from the remote node.
The JSONRPCNode will call this method during initialization to set up
message reception. The transport should call the provided callback
whenever a message is received from the remote side.

#### Parameters

##### callback

(`message`) => `void`

Function to call when messages are received

#### Returns

`void`

***

### send()

> **send**(`message`): `Promise`\<`void`\>

Defined in: [core/jsonrpc/src/types.ts:512](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/jsonrpc/src/types.ts#L512)

Sends a JSON-RPC message to the remote node.
The implementation should handle message serialization and delivery.

#### Parameters

##### message

`unknown`

The message to send. This will be a JSON-RPC request,
                response, or event object that needs to be delivered to
                the remote node.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the message has been sent

#### Throws

If message delivery fails (e.g., connection lost)
