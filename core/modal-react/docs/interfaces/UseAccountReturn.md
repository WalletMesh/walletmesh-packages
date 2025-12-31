[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAccountReturn

# Interface: UseAccountReturn

Defined in: [core/modal-react/src/types.ts:639](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L639)

Account hook return type
Provides account information

## Properties

### accounts

> **accounts**: `string`[]

Defined in: [core/modal-react/src/types.ts:645](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L645)

All connected accounts

***

### address

> **address**: `null` \| `string`

Defined in: [core/modal-react/src/types.ts:641](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L641)

Primary account address

***

### chain

> **chain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/types.ts:643](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L643)

Current chain

***

### connectedWallets

> **connectedWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:649](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L649)

Connected wallets with account info

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/types.ts:647](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L647)

Whether any wallet is connected

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/types.ts:651](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L651)

Current provider instance
