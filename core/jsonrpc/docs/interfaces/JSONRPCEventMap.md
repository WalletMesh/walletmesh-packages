[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventMap

# Interface: JSONRPCEventMap

Defined in: [core/jsonrpc/src/types.ts:532](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L532)

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
