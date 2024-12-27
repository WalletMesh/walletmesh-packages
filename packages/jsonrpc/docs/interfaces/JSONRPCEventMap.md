[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventMap

# Interface: JSONRPCEventMap

Maps event names to their payload types for JSON-RPC events.

## Example

```typescript
type EventMap = {
  userJoined: { username: string; timestamp: number };
  statusUpdate: { user: string; status: 'online' | 'offline' };
  messageReceived: { text: string; from: string };
};
```

## Indexable

 \[`event`: `string`\]: `unknown`
