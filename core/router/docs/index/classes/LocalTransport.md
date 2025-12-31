[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / LocalTransport

# Class: LocalTransport

Defined in: [core/router/src/localTransport.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L67)

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

Defined in: [core/router/src/localTransport.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L80)

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

Defined in: [core/router/src/localTransport.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L90)

Connect this transport to a remote JSONRPCNode

#### Parameters

##### remoteNode

`JSONRPCNode`\<`JSONRPCMethodMap`, `JSONRPCEventMap`, `JSONRPCContext`\>

#### Returns

`void`

***

### getMessageContext()

> **getMessageContext**(): `undefined` \| `TransportContext`

Defined in: [core/router/src/localTransport.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L177)

Get context information from the last received message.
LocalTransport extracts context from the `_context` field that may be
attached to messages by upstream components (e.g., router forwarding
origin information to wallet nodes).

#### Returns

`undefined` \| `TransportContext`

TransportContext if available in the last message, undefined otherwise

#### Example

```typescript
const transport = new LocalTransport();
// After receiving a message with _context field...
const context = transport.getMessageContext();
if (context) {
  console.log('Origin:', context.origin);
  console.log('Trusted:', context.trustedSource); // false - forwarded context
}
```

#### Implementation of

`JSONRPCTransport.getMessageContext`

***

### onMessage()

> **onMessage**(`handler`): `void`

Defined in: [core/router/src/localTransport.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L125)

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

Defined in: [core/router/src/localTransport.ts:132](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L132)

Receive a message and pass it to the registered handler

#### Parameters

##### message

`unknown`

#### Returns

`void`

***

### send()

> **send**(`message`): `Promise`\<`void`\>

Defined in: [core/router/src/localTransport.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/localTransport.ts#L97)

Send a message to the connected remote node

#### Parameters

##### message

`unknown`

#### Returns

`Promise`\<`void`\>

#### Implementation of

`JSONRPCTransport.send`
