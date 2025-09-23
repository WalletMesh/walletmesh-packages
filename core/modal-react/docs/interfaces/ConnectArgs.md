[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectArgs

# Interface: ConnectArgs

Defined in: [core/modal-react/src/hooks/useConnect.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L52)

Connection arguments

## Properties

### chain?

> `optional` **chain**: [`ChainConfig`](ChainConfig.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L56)

Chain to connect to - defaults to the wallet's default chain

***

### walletId?

> `optional` **walletId**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useConnect.ts#L54)

Wallet ID to connect to - if not provided, shows wallet selection modal
