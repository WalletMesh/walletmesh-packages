[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventMap

# Type Alias: JSONRPCEventMap

> **JSONRPCEventMap**: `object`

Maps event names to their payload types for JSON-RPC events.

## Index Signature

 \[`event`: `string`\]: `unknown`

## Example

```typescript
type EventMap = {
  userJoined: { username: string; timestamp: number };
  statusUpdate: { user: string; status: 'online' | 'offline' };
  messageReceived: { text: string; from: string };
};
```

## Defined in

[packages/jsonrpc/src/types.ts:321](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L321)
