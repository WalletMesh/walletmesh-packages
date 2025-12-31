[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseConnectionReturn

# Interface: UseConnectionReturn

Defined in: [core/modal-react/src/types.ts:600](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L600)

Connection hook return type
Provides connection state and methods with loading states

## Properties

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/types.ts:610](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L610)

Primary connected address

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/types.ts:612](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L612)

Current chain

***

### connect()

> **connect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:602](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L602)

Connect to a wallet

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### connectedWallets

> **connectedWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:614](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L614)

Connected wallets

***

### disconnect()

> **disconnect**: (`walletId?`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/types.ts:604](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L604)

Disconnect from a specific wallet

#### Parameters

##### walletId?

`string`

#### Returns

`Promise`\<`void`\>

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/types.ts:608](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L608)

Whether any wallet is connected

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/types.ts:606](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L606)

Whether connection is in progress

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/types.ts:616](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/types.ts#L616)

Current provider instance
