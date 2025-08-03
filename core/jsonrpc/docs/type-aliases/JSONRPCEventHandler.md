[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCEventHandler

# Type Alias: JSONRPCEventHandler()\<T, E\>

> **JSONRPCEventHandler**\<`T`, `E`\> = (`params`) => `void`

Defined in: [core/jsonrpc/src/types.ts:650](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L650)

Represents a function that handles JSON-RPC events.
Event handlers receive typed event payloads and are used to react to
events emitted by remote nodes. Unlike method handlers, event handlers
are synchronous and don't return responses.

## Type Parameters

### T

`T` *extends* [`JSONRPCEventMap`](../interfaces/JSONRPCEventMap.md)

The event map defining available events and their payload types

### E

`E` *extends* keyof `T`

The specific event being handled (must be a key of T)

## Parameters

### params

`T`\[`E`\]

## Returns

`void`

## Example

```typescript
// Simple event logging
const logHandler: JSONRPCEventHandler<EventMap, 'userJoined'> =
  ({ username, timestamp }) => {
    console.log(`${username} joined at ${new Date(timestamp)}`);
  };

// Event handler with state updates
const statusHandler: JSONRPCEventHandler<EventMap, 'statusUpdate'> =
  ({ user, status, lastSeen }) => {
    userStates.set(user, { status, lastSeen });
    ui.updateUserStatus(user, status);
  };

// Event handler with error handling
const messageHandler: JSONRPCEventHandler<EventMap, 'messageReceived'> =
  ({ id, text, from, timestamp, attachments }) => {
    try {
      chatLog.addMessage({ id, text, from, timestamp });
      if (attachments?.length) {
        attachments.forEach(attachment => {
          mediaCache.preload(attachment.url);
        });
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  };

// Register handlers
peer.on('userJoined', logHandler);
peer.on('statusUpdate', statusHandler);
peer.on('messageReceived', messageHandler);
```
