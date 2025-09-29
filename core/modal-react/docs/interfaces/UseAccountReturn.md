[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAccountReturn

# Interface: UseAccountReturn

Defined in: [core/modal-react/src/types.ts:506](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L506)

Account hook return type
Provides account information

## Properties

### accounts

> **accounts**: `string`[]

Defined in: [core/modal-react/src/types.ts:512](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L512)

All connected accounts

***

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/types.ts:508](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L508)

Primary account address

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/types.ts:510](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L510)

Current chain

***

### connectedWallets

> **connectedWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:516](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L516)

Connected wallets with account info

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/types.ts:514](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L514)

Whether any wallet is connected

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/types.ts:518](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/types.ts#L518)

Current provider instance
