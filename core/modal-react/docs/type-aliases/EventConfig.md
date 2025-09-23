[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EventConfig

# Type Alias: EventConfig\<K\>

> **EventConfig**\<`K`\> = `K` \| \[`K`, [`WalletEventHandler`](WalletEventHandler.md)\<[`ModalEventMap`](../interfaces/ModalEventMap.md)\[`K`\]\>\] \| \[`K`, [`WalletEventHandler`](WalletEventHandler.md)\<[`ModalEventMap`](../interfaces/ModalEventMap.md)\[`K`\]\>, [`EventOptions`](../interfaces/EventOptions.md)\]

Defined in: [core/modal-react/src/hooks/useWalletEvents.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useWalletEvents.ts#L34)

Event subscription configuration

## Type Parameters

### K

`K` *extends* keyof [`ModalEventMap`](../interfaces/ModalEventMap.md) = keyof [`ModalEventMap`](../interfaces/ModalEventMap.md)
