[**@walletmesh/modal v0.0.7**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / Transport

# Interface: Transport

Defined in: [core/modal/src/lib/transports/types.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L70)

Core transport interface.

Provides a standardized way to communicate between the dApp and wallet,
abstracting the underlying transport mechanism (PostMessage, Chrome Extension, WebSocket).

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L75)

Establishes the transport connection.

#### Returns

`Promise`\<`void`\>

#### Throws

If connection fails

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L81)

Terminates the transport connection.

#### Returns

`Promise`\<`void`\>

#### Throws

If disconnection fails

***

### send()

> **send**(`data`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L88)

Sends data through the transport.

#### Parameters

##### data

`unknown`

Data to send

#### Returns

`Promise`\<`void`\>

#### Throws

If send operation fails

***

### onMessage()

> **onMessage**(`handler`): `void`

Defined in: [core/modal/src/lib/transports/types.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L94)

Registers message handler.

#### Parameters

##### handler

(`data`) => `void`

Function to handle incoming messages

#### Returns

`void`

***

### offMessage()

> **offMessage**(`handler`): `void`

Defined in: [core/modal/src/lib/transports/types.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L100)

Removes message handler.

#### Parameters

##### handler

(`data`) => `void`

Previously registered handler to remove

#### Returns

`void`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [core/modal/src/lib/transports/types.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L105)

Checks if transport is currently connected.

#### Returns

`boolean`

***

### getType()

> **getType**(): [`TransportType`](../type-aliases/TransportType.md)

Defined in: [core/modal/src/lib/transports/types.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/lib/transports/types.ts#L110)

Gets transport type identifier.

#### Returns

[`TransportType`](../type-aliases/TransportType.md)
