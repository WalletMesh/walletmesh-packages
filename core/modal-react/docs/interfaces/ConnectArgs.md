[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectArgs

# Interface: ConnectArgs

Defined in: [core/modal-react/src/hooks/useConnect.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useConnect.ts#L58)

Connection arguments

## Properties

### chain?

> `optional` **chain**: [`ChainConfig`](ChainConfig.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useConnect.ts#L62)

Chain to connect to - defaults to the wallet's default chain

***

### walletId?

> `optional` **walletId**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useConnect.ts#L60)

Wallet ID to connect to - if not provided, shows wallet selection modal
