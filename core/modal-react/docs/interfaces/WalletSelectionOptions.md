[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletSelectionOptions

# Interface: WalletSelectionOptions

Defined in: [core/modal-react/src/hooks/useAccount.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L107)

Wallet selection options

## Properties

### autoSelectSingle?

> `optional` **autoSelectSingle**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:115](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L115)

Whether to auto-select if only one wallet is available

***

### filterByChainType?

> `optional` **filterByChainType**: [`ChainType`](../enumerations/ChainType.md)[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L113)

Filter wallets by supported chain types

***

### persistPreference?

> `optional` **persistPreference**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L109)

Persist wallet preference to localStorage

***

### storageKey?

> `optional` **storageKey**: `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:111](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAccount.ts#L111)

Storage key for persisted preference
