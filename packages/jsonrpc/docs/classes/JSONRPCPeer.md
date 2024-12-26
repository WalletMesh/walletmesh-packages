[@walletmesh/jsonrpc - v0.1.0](../README.md) / [Exports](../modules.md) / JSONRPCPeer

# Class: JSONRPCPeer\<T, E, C\>

Core class implementing the JSON-RPC 2.0 protocol with bi-directional communication support.

Features:
- Full JSON-RPC 2.0 protocol implementation
- Bi-directional communication (each peer can both send and receive)
- Type-safe method and event definitions
- Middleware support for request/response modification
- Custom serialization for complex data types
- Request timeouts
- Event system for broadcast-style communication
- Comprehensive error handling

**`Example`**

```typescript
// Define your types
type MethodMap = {
  add: {
    params: { a: number; b: number };
    result: number;
  };
  getUser: {
    params: { id: string };
    result: User;
  };
};

type EventMap = {
  userJoined: { username: string };
  statusUpdate: { user: string; status: 'online' | 'offline' };
};

type Context = {
  userId?: string;
  isAuthorized?: boolean;
};

// Create a peer instance
const peer = new JSONRPCPeer<MethodMap, EventMap, Context>({
  send: message => websocket.send(JSON.stringify(message))
});

// Register methods
peer.registerMethod('add', (context, { a, b }) => a + b);

peer.registerMethod('getUser', async (context, { id }) => {
  if (!context.isAuthorized) {
    throw new JSONRPCError(-32600, 'Unauthorized');
  }
  return await db.users.findById(id);
});

// Add middleware
peer.addMiddleware(async (context, request, next) => {
  console.log('Request:', request);
  const response = await next();
  console.log('Response:', response);
  return response;
});

// Handle events
peer.on('userJoined', ({ username }) => {
  console.log(`${username} joined`);
});

// Call remote methods
try {
  const sum = await peer.callMethod('add', { a: 1, b: 2 });
  const user = await peer.callMethod('getUser', { id: '123' }, 5);
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof JSONRPCError) {
    console.error('RPC Error:', error.message);
  }
}

// Emit events
peer.emit('statusUpdate', {
  user: 'Alice',
  status: 'online'
});
```

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) = [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) | The RPC method map defining available methods |
| `E` | extends [`JSONRPCEventMap`](../modules.md#jsonrpceventmap) = [`JSONRPCEventMap`](../modules.md#jsonrpceventmap) | The event map defining available events |
| `C` | extends [`JSONRPCContext`](../modules.md#jsonrpccontext) = [`JSONRPCContext`](../modules.md#jsonrpccontext) | The context type for method handlers |

## Table of contents

### Constructors

- [constructor](JSONRPCPeer.md#constructor)

### Properties

- [context](JSONRPCPeer.md#context)

### Methods

- [addMiddleware](JSONRPCPeer.md#addmiddleware)
- [callMethod](JSONRPCPeer.md#callmethod)
- [emit](JSONRPCPeer.md#emit)
- [notify](JSONRPCPeer.md#notify)
- [on](JSONRPCPeer.md#on)
- [receiveMessage](JSONRPCPeer.md#receivemessage)
- [registerMethod](JSONRPCPeer.md#registermethod)
- [registerSerializer](JSONRPCPeer.md#registerserializer)

## Constructors

### constructor

• **new JSONRPCPeer**\<`T`, `E`, `C`\>(`transport`, `context?`): [`JSONRPCPeer`](JSONRPCPeer.md)\<`T`, `E`, `C`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) = [`JSONRPCMethodMap`](../modules.md#jsonrpcmethodmap) |
| `E` | extends [`JSONRPCEventMap`](../modules.md#jsonrpceventmap) = [`JSONRPCEventMap`](../modules.md#jsonrpceventmap) |
| `C` | extends [`JSONRPCContext`](../modules.md#jsonrpccontext) = [`JSONRPCContext`](../modules.md#jsonrpccontext) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport` | [`Transport`](../modules.md#transport)\<`T`, `E`\> |
| `context` | `C` |

#### Returns

[`JSONRPCPeer`](JSONRPCPeer.md)\<`T`, `E`, `C`\>

#### Defined in

[packages/jsonrpc/src/peer.ts:250](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L250)

## Properties

### context

• `Readonly` **context**: `C`

#### Defined in

[packages/jsonrpc/src/peer.ts:252](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L252)

## Methods

### addMiddleware

▸ **addMiddleware**(`middleware`): () => `void`

Adds a middleware function to the middleware stack.
Middleware functions are executed in the order they are added,
and can modify both requests and responses.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `middleware` | [`JSONRPCMiddleware`](../modules.md#jsonrpcmiddleware)\<`T`, `C`\> | The middleware function to add |

#### Returns

`fn`

A cleanup function that removes the middleware when called

▸ (): `void`

##### Returns

`void`

**`Example`**

```typescript
const cleanup = peer.addMiddleware(async (context, request, next) => {
  console.log('Request:', request);
  const response = await next();
  console.log('Response:', response);
  return response;
});

// Later...
cleanup(); // Remove the middleware
```

#### Defined in

[packages/jsonrpc/src/peer.ts:510](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L510)

___

### callMethod

▸ **callMethod**\<`M`\>(`method`, `params?`, `timeoutInSeconds?`): `Promise`\<`T`[`M`][``"result"``]\>

Calls a method on the remote peer.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `method` | `M` | `undefined` | The name of the method to call |
| `params?` | `T`[`M`][``"params"``] | `undefined` | The parameters to pass to the method |
| `timeoutInSeconds` | `number` | `0` | Optional timeout in seconds (0 means no timeout) |

#### Returns

`Promise`\<`T`[`M`][``"result"``]\>

A promise that resolves with the method result

**`Throws`**

If the method call fails or times out

**`Example`**

```typescript
try {
  const result = await peer.callMethod('add', { a: 1, b: 2 }, 5);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
```

#### Defined in

[packages/jsonrpc/src/peer.ts:323](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L323)

___

### emit

▸ **emit**\<`K`\>(`event`, `params`): `void`

Emits an event to the remote peer.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The name of the event to emit |
| `params` | `E`[`K`] | The event parameters |

#### Returns

`void`

**`Example`**

```typescript
peer.emit('statusUpdate', {
  user: 'Alice',
  status: 'online'
});
```

#### Defined in

[packages/jsonrpc/src/peer.ts:432](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L432)

___

### notify

▸ **notify**\<`M`\>(`method`, `params`): `void`

Sends a notification to the remote peer (no response expected).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `M` | The name of the method to call |
| `params` | `T`[`M`][``"params"``] | The parameters to pass to the method |

#### Returns

`void`

**`Example`**

```typescript
peer.notify('logMessage', { level: 'info', message: 'Hello' });
```

#### Defined in

[packages/jsonrpc/src/peer.ts:373](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L373)

___

### on

▸ **on**\<`K`\>(`event`, `handler`): () => `void`

Registers a handler for a specific event type.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `K` | The name of the event to handle |
| `handler` | [`JSONRPCEventHandler`](../modules.md#jsonrpceventhandler)\<`E`, `K`\> | The function to call when the event is received |

#### Returns

`fn`

A cleanup function that removes the event handler when called

▸ (): `void`

##### Returns

`void`

**`Example`**

```typescript
const cleanup = peer.on('userJoined', ({ username }) => {
  console.log(`${username} joined`);
});

// Later...
cleanup(); // Remove the event handler
```

#### Defined in

[packages/jsonrpc/src/peer.ts:402](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L402)

___

### receiveMessage

▸ **receiveMessage**(`message`): `Promise`\<`void`\>

Handles an incoming message from the remote peer.
This should be called whenever a message is received through the transport.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `unknown` | The received message |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the message has been handled

**`Example`**

```typescript
websocket.on('message', async (data) => {
  await peer.receiveMessage(JSON.parse(data));
});
```

#### Defined in

[packages/jsonrpc/src/peer.ts:455](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L455)

___

### registerMethod

▸ **registerMethod**\<`M`\>(`name`, `handler`, `serializer?`): `void`

Registers a method that can be called by remote peers.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `M` | The name of the method to register |
| `handler` | `MethodHandler`\<`T`, `M`, `C`\> | The function that implements the method |
| `serializer?` | [`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`[`M`][``"params"``], `T`[`M`][``"result"``]\> | Optional serializer for method parameters and results |

#### Returns

`void`

**`Example`**

```typescript
peer.registerMethod('add', async (context, params) => {
  return params.a + params.b;
});
```

#### Defined in

[packages/jsonrpc/src/peer.ts:272](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L272)

___

### registerSerializer

▸ **registerSerializer**\<`M`\>(`method`, `serializer`): `void`

Registers a serializer for a remote method.
Used when calling methods that require parameter or result serialization.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `string` \| `number` \| `symbol` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `M` | The name of the method to register a serializer for |
| `serializer` | [`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`T`[`M`][``"params"``], `T`[`M`][``"result"``]\> | The serializer implementation |

#### Returns

`void`

**`Example`**

```typescript
peer.registerSerializer('processDate', {
  params: {
    serialize: (date) => ({ serialized: date.toISOString() }),
    deserialize: (data) => new Date(data.serialized)
  }
});
```

#### Defined in

[packages/jsonrpc/src/peer.ts:297](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/peer.ts#L297)
