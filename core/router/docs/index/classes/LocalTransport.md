[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / LocalTransport

# Class: LocalTransport

Defined in: [core/router/src/localTransport.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/localTransport.ts#L66)

A local transport that directly connects two JSONRPCNodes without network overhead.
This transport calls receiveMessage directly on the connected nodes, maintaining
proper serialization and protocol handling while avoiding actual transport costs.

This is particularly useful for connecting a WalletRouter to a local wallet
implementation, ensuring proper message serialization without the overhead
of a real transport.

## Example

```typescript
// Create a bidirectional local transport pair
const [clientTransport, serverTransport] = createLocalTransportPair();

// Create server with wallet implementation
const server = new JSONRPCNode(serverTransport, walletContext);
server.registerMethod('eth_accounts', async () => ['0x...']);

// Use client transport directly with router
const router = new WalletRouter(transport, new Map([
  ['eip155:1', clientTransport]
]), permissionManager);
```

## Implements

- `JSONRPCTransport`

## Constructors

### Constructor

> **new LocalTransport**(`options`): `LocalTransport`

Defined in: [core/router/src/localTransport.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/localTransport.ts#L75)

Creates an instance of LocalTransport.

#### Parameters

##### options

[`LocalTransportOptions`](../interfaces/LocalTransportOptions.md) = `{}`

Configuration options for the transport

#### Returns

`LocalTransport`

## Methods

### connectTo()

> **connectTo**(`remoteNode`): `void`

Defined in: [core/router/src/localTransport.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/localTransport.ts#L85)

Connect this transport to a remote JSONRPCNode

#### Parameters

##### remoteNode

`JSONRPCNode`\<`JSONRPCMethodMap`, `JSONRPCEventMap`, `JSONRPCContext`\>

#### Returns

`void`

***

### onMessage()

> **onMessage**(`handler`): `void`

Defined in: [core/router/src/localTransport.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/localTransport.ts#L120)

Register a message handler for incoming messages

#### Parameters

##### handler

(`message`) => `void`

#### Returns

`void`

#### Implementation of

`JSONRPCTransport.onMessage`

***

### receive()

> **receive**(`message`): `void`

Defined in: [core/router/src/localTransport.ts:127](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/localTransport.ts#L127)

Receive a message and pass it to the registered handler

#### Parameters

##### message

`unknown`

#### Returns

`void`

***

### send()

> **send**(`message`): `Promise`\<`void`\>

Defined in: [core/router/src/localTransport.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/localTransport.ts#L92)

Send a message to the connected remote node

#### Parameters

##### message

`unknown`

#### Returns

`Promise`\<`void`\>

#### Implementation of

`JSONRPCTransport.send`
