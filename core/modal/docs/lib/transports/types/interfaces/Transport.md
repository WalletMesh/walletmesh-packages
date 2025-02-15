[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/transports/types](../README.md) / Transport

# Interface: Transport

Defined in: [core/modal/src/lib/transports/types.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/transports/types.ts#L31)

Core interface for managing communication between dApp and wallet.

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/transports/types.ts#L32)

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/transports/types.ts#L33)

#### Returns

`Promise`\<`void`\>

***

### send()

> **send**(`data`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/transports/types.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/transports/types.ts#L34)

#### Parameters

##### data

`unknown`

#### Returns

`Promise`\<`void`\>

***

### onMessage()

> **onMessage**(`handler`): `void`

Defined in: [core/modal/src/lib/transports/types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/transports/types.ts#L35)

#### Parameters

##### handler

(`data`) => `void`

#### Returns

`void`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [core/modal/src/lib/transports/types.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/transports/types.ts#L36)

#### Returns

`boolean`
