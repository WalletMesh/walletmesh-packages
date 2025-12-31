[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCTransport

# Interface: JSONRPCTransport

Defined in: [core/jsonrpc/src/types.ts:557](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L557)

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

// postMessage transport with origin validation and context
const windowTransport: JSONRPCTransport = {
  lastOrigin: undefined as string | undefined,
  send: async message => {
    if (!targetWindow) {
      throw new Error('Target window not available');
    }
    targetWindow.postMessage(JSON.stringify(message), targetOrigin);
  },
  onMessage: callback => {
    window.addEventListener('message', event => {
      if (event.origin === targetOrigin && event.data) {
        this.lastOrigin = event.origin; // Capture trusted origin
        callback(event.data);
      }
    });
  },
  getMessageContext: () => ({
    origin: this.lastOrigin,
    trustedSource: true,
    transportType: 'popup'
  })
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

### getMessageContext()?

> `optional` **getMessageContext**(): `undefined` \| [`TransportContext`](TransportContext.md)

Defined in: [core/jsonrpc/src/types.ts:631](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L631)

Get trusted context information for the most recently received message.
This method is optional and should only be implemented by transports that
have access to trusted metadata (e.g., browser-validated origin from MessageEvent).

Transports that implement this method can provide:
- Browser-validated origin (from MessageEvent.origin, Chrome runtime sender, etc.)
- Forwarded context from upstream (e.g., local transport forwarding router context)
- Transport-specific metadata

#### Returns

`undefined` \| [`TransportContext`](TransportContext.md)

TransportContext if available, undefined otherwise

#### Example

```typescript
// PostMessage transport with browser-validated origin
class PopupTransport implements JSONRPCTransport {
  private lastMessageOrigin?: string;

  onMessage(callback) {
    window.addEventListener('message', (event: MessageEvent) => {
      this.lastMessageOrigin = event.origin; // Browser-validated
      callback(event.data);
    });
  }

  getMessageContext(): TransportContext {
    return {
      origin: this.lastMessageOrigin,
      trustedSource: true,  // Browser API
      transportType: 'popup'
    };
  }
}

// Local transport forwarding router context
class LocalTransport implements JSONRPCTransport {
  private lastMessage?: any;

  getMessageContext(): TransportContext | undefined {
    if (this.lastMessage?._context?.origin) {
      return {
        origin: this.lastMessage._context.origin,
        trustedSource: false, // Forwarded, not browser-validated
        transportType: 'local'
      };
    }
    return undefined;
  }
}
```

***

### onMessage()

> **onMessage**(`callback`): `void`

Defined in: [core/jsonrpc/src/types.ts:578](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L578)

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

Defined in: [core/jsonrpc/src/types.ts:568](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L568)

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
