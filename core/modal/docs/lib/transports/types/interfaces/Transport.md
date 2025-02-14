[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / Transport

# Interface: Transport

Defined in: [core/modal/src/lib/transports/types.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L47)

Core interface for managing communication between dApp and wallet.

Transport implementations provide a standardized way to handle
bi-directional communication between a dApp and wallet, abstracting
the underlying transport mechanism (PostMessage, WebSocket, etc.).

Key responsibilities:
- Connection management
- Message sending and receiving
- Error handling
- Resource cleanup

## Remarks

Each transport type handles specific communication scenarios:
- PostMessage: For iframe/popup communication
- WebSocket: For remote wallet connections
- Extension: For browser extension wallets
- Null: For testing and development

## Example

```typescript
class MyTransport implements Transport {
  async connect(): Promise<void> {
    // Setup connection
  }

  async disconnect(): Promise<void> {
    // Cleanup connection
  }

  async send(data: unknown): Promise<void> {
    // Send data to wallet
  }

  onMessage(handler: (data: unknown) => void): void {
    // Register message handler
  }

  isConnected(): boolean {
    // Return connection status
    return true;
  }
}
```

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L68)

Initializes and establishes the transport connection.

#### Returns

`Promise`\<`void`\>

Promise that resolves when connection is ready

#### Throws

If connection fails, times out, or is rejected

#### Remarks

Connection process typically involves:
1. Validating configuration
2. Setting up communication channel
3. Performing handshake if required
4. Initializing message handlers

#### Example

```typescript
const transport = new PostMessageTransport(config);
await transport.connect();
console.log('Connected:', transport.isConnected());
```

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L93)

Terminates the transport connection and cleans up resources.

#### Returns

`Promise`\<`void`\>

Promise that resolves when cleanup is complete

#### Throws

If disconnection or cleanup fails

#### Remarks

Cleanup tasks include:
- Closing communication channels
- Removing event listeners
- Canceling pending operations
- Releasing system resources

#### Example

```typescript
try {
  await transport.disconnect();
  console.log('Disconnected successfully');
} catch (error) {
  console.error('Cleanup failed:', error);
}
```

***

### send()

> **send**(`data`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L118)

Sends data to the connected wallet.

#### Parameters

##### data

`unknown`

Data to transmit to the wallet

#### Returns

`Promise`\<`void`\>

Promise that resolves when send is complete

#### Throws

If send fails, connection is lost, or data is invalid

#### Remarks

Sending process includes:
- Connection state validation
- Data serialization if needed
- Transmission error handling
- Delivery confirmation (if supported)

#### Example

```typescript
await transport.send({
  type: 'REQUEST',
  method: 'eth_requestAccounts',
  params: []
});
```

***

### onMessage()

> **onMessage**(`handler`): `void`

Defined in: [core/modal/src/lib/transports/types.ts:149](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L149)

Registers a callback to handle incoming messages.

#### Parameters

##### handler

(`data`) => `void`

Function to process incoming messages

#### Returns

`void`

#### Remarks

Handler registration:
- Multiple handlers can be registered
- Handlers should be lightweight to avoid blocking
- Errors in handlers won't affect transport
- Messages are processed in order received

#### Example

```typescript
transport.onMessage((data) => {
  console.log('Received:', data);
  // Process message...
});

// Error handling
transport.onMessage((data) => {
  try {
    processMessage(data);
  } catch (error) {
    console.error('Handler error:', error);
  }
});
```

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [core/modal/src/lib/transports/types.ts:168](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/transports/types.ts#L168)

Checks if the transport connection is active.

#### Returns

`boolean`

True if connected and ready, false otherwise

#### Remarks

Connection states:
- true: Connection established and ready for messages
- false: Not connected, disconnected, or connection failed

#### Example

```typescript
if (!transport.isConnected()) {
  await transport.connect();
}
```
