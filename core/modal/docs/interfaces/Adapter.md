[**@walletmesh/modal v0.0.4**](../README.md)

***

[@walletmesh/modal](../globals.md) / Adapter

# Interface: Adapter

Defined in: [core/modal/src/lib/adapters/types.ts:6](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/adapters/types.ts#L6)

Interface for chain-specific adapters

## Methods

### connect()

> **connect**(`walletInfo`): `Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/adapters/types.ts:8](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/adapters/types.ts#L8)

Connects to the wallet and returns connected wallet information

#### Parameters

##### walletInfo

[`WalletInfo`](WalletInfo.md)

#### Returns

`Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/adapters/types.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/adapters/types.ts#L11)

Disconnects from the wallet and cleans up

#### Returns

`Promise`\<`void`\>

***

### getProvider()

> **getProvider**(): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/adapters/types.ts:14](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/adapters/types.ts#L14)

Retrieves the chain-specific provider instance

#### Returns

`Promise`\<`unknown`\>

***

### handleMessage()

> **handleMessage**(`data`): `void`

Defined in: [core/modal/src/lib/adapters/types.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/adapters/types.ts#L17)

Handles incoming messages from the transport

#### Parameters

##### data

`unknown`

#### Returns

`void`
