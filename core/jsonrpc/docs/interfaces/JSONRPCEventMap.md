[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventMap

# Interface: JSONRPCEventMap

Defined in: [core/jsonrpc/src/types.ts:559](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/jsonrpc/src/types.ts#L559)

Maps event names to their payload types for JSON-RPC events.
Events provide a way to handle asynchronous notifications with typed payloads.
Unlike methods, events are one-way communications and don't expect responses.

## Example

```typescript
// Define event types with their payloads
type EventMap = {
  // User lifecycle events
  userJoined: { username: string; timestamp: number };
  userLeft: { username: string; timestamp: number };

  // Status events
  statusUpdate: {
    user: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: number;
  };

  // Chat events
  messageReceived: {
    id: string;
    text: string;
    from: string;
    timestamp: number;
    attachments?: Array<{
      type: 'image' | 'file';
      url: string;
    }>;
  };
};
```

## Indexable

\[`event`: `string`\]: `unknown`
