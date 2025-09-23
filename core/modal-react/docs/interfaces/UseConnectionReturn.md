[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseConnectionReturn

# Interface: UseConnectionReturn

Defined in: [core/modal-react/src/types.ts:467](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L467)

Connection hook return type
Provides connection state and methods with loading states

## Properties

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/types.ts:477](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L477)

Primary connected address

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/types.ts:479](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L479)

Current chain

***

### connect()

> **connect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:469](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L469)

Connect to a wallet

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### connectedWallets

> **connectedWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:481](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L481)

Connected wallets

***

### disconnect()

> **disconnect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:471](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L471)

Disconnect from a specific wallet

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/types.ts:475](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L475)

Whether any wallet is connected

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/types.ts:473](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L473)

Whether connection is in progress

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/types.ts:483](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L483)

Current provider instance
