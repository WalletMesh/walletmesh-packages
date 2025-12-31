[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletSelectionOptions

# Interface: WalletSelectionOptions

Defined in: [core/modal-react/src/hooks/useAccount.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L110)

Wallet selection options

## Properties

### autoSelectSingle?

> `optional` **autoSelectSingle**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L118)

Whether to auto-select if only one wallet is available

***

### filterByChainType?

> `optional` **filterByChainType**: [`ChainType`](../enumerations/ChainType.md)[]

Defined in: [core/modal-react/src/hooks/useAccount.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L116)

Filter wallets by supported chain types

***

### persistPreference?

> `optional` **persistPreference**: `boolean`

Defined in: [core/modal-react/src/hooks/useAccount.ts:112](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L112)

Persist wallet preference to localStorage

***

### storageKey?

> `optional` **storageKey**: `string`

Defined in: [core/modal-react/src/hooks/useAccount.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAccount.ts#L114)

Storage key for persisted preference
