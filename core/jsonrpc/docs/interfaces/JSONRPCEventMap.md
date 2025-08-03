[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventMap

# Interface: JSONRPCEventMap

Defined in: [core/jsonrpc/src/types.ts:559](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L559)

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
