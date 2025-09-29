[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletTransport

# Interface: WalletTransport

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L20)

Wallet transport interface for low-level communication

## Methods

### connect()

> **connect**(): `Promise`\<`string`\>

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L21)

#### Returns

`Promise`\<`string`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L22)

#### Returns

`Promise`\<`void`\>

***

### getCapabilities()

> **getCapabilities**(): `Promise`\<`unknown`\>

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L24)

#### Returns

`Promise`\<`unknown`\>

***

### getSessionId()

> **getSessionId**(): `undefined` \| `string`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L26)

#### Returns

`undefined` \| `string`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:25](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L25)

#### Returns

`boolean`

***

### off()

> **off**(`event`, `handler`): `void`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L28)

#### Parameters

##### event

`string`

##### handler

(`data`) => `void`

#### Returns

`void`

***

### on()

> **on**(`event`, `handler`): `void`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L27)

#### Parameters

##### event

`string`

##### handler

(`data`) => `void`

#### Returns

`void`

***

### request()

> **request**\<`T`\>(`request`): `Promise`\<`T`\>

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useWalletTransport.ts#L23)

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### request

###### method

`string`

###### params?

`unknown`

#### Returns

`Promise`\<`T`\>
